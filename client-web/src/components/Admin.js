import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { ScanQrCode, History, Package, QrCode, Settings, Users } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import BorrowPage from './BorrowPage';
import QRScannerCamera from './QRScannerCamera';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';
import ProductsTab from './ProductsTab';


// Helper function to format date as DD.MM.YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Helper function to get current date formatted
const getCurrentDate = () => {
  return formatDate(new Date());
};

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');

  // QR Scanner states
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  // Set default tab to 'camera' on mobile, otherwise based on role
  const [activeTab, setActiveTab] = useState(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (currentUser?.role === "student") {
      return "history"; // opiskelijan aloitusnäkymä
    }

    if (isMobile) {
      return "camera";
    }

    return currentUser?.role === "admin" ? "users" : "history";
  });

  const [users, setUsers] = useState([
    { id: 2, name: 'Mikko', email: 'mikko@example.com', role: 'student' },
    { id: 3, name: 'Ville', email: 'ville@example.com', role: 'student' },
    { id: 5, name: 'Aino', email: 'aino@example.com', role: 'student' },
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  ]);

  const [borrowingHistory, setBorrowingHistory] = useState([
    { id: 1, userName: 'Mikko', productName: 'Laptop Dell XPS', borrowedAt: '2024-01-15', returnedAt: '2024-01-20', status: 'Returned', userId: 2 },
    { id: 2, userName: 'Ville', productName: 'Monitor Samsung', borrowedAt: '2024-01-18', returnedAt: null, status: 'On Loan', userId: 3 },
    { id: 3, userName: 'Aino', productName: 'Keyboard Mechanical', borrowedAt: '2024-01-10', returnedAt: '2024-01-17', status: 'Returned', userId: 5 },
    { id: 4, userName: 'Mikko', productName: 'Headphones Sony', borrowedAt: '2024-01-22', returnedAt: null, status: 'On Loan', userId: 2 },
  ]);

  // Construct the API path with borrower filter for students
  const getHistoryPath = () => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
      return 'borrowing-history';
    } else {
      // Filter by current user's ID for students
      return `borrowing-history?borrower_id=${currentUser?.id}`;
    }
  };

  const getUserData = () => {
    if (currentUser?.role === 'admin') return users;
    return users.filter(u => u.id === currentUser?.id);
  };

  const getBorrowingHistory = () => {
    if (currentUser?.role === 'admin') return borrowingHistory;
    return borrowingHistory.filter(r => r.userId === currentUser?.id);
  };

  // Filter functions for search
  const getFilteredUsers = () => {
    const data = getUserData();
    if (!userQuery.trim()) return data;

    const query = userQuery.toLowerCase();
    return data.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  };

  const getFilteredHistory = () => {
    const data = getBorrowingHistory();
    if (!userQuery.trim()) return data;

    const query = userQuery.toLowerCase();
    return data.filter(record =>
      record.userName?.toLowerCase().includes(query) ||
      record.productName?.toLowerCase().includes(query) ||
      record.status?.toLowerCase().includes(query)
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Only change tab when transitioning between mobile/desktop
      if (mobile !== wasMobile) {
        // When switching TO mobile from desktop
        if (mobile && !wasMobile && activeTab !== 'camera' && activeTab !== 'settings') {
          setActiveTab('camera');
        }
        // When switching TO desktop from mobile  
        else if (!mobile && wasMobile && activeTab === 'camera') {
          setActiveTab(currentUser?.role === 'admin' ? 'users' : 'history');
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, activeTab, currentUser]);

  useEffect(() => {
    if (!isMobile && activeTab === 'settings') {
      setActiveTab(currentUser?.role === 'admin' ? 'users' : 'history');
    }
  }, [isMobile, activeTab, currentUser]);

  useEffect(() => {
    if (activeTab !== 'settings' && passwordStatus) {
      setPasswordStatus(null);
    }
  }, [activeTab, passwordStatus]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDataChange = (updatedData) => {
    if (activeTab === 'users') setUsers(updatedData);
    else if (activeTab === 'history') setBorrowingHistory(updatedData);
  };

  const handleEditRow = (row) => {
    console.log('Edited row:', row);
  };

  const handleDeleteUser = (row) => {
    if (row.name === currentUser?.name) {
      alert("You cannot delete your own account!");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${row.name}"?`)) {
      setUsers(users.filter(u => u.id !== row.id));
      alert(`User "${row.name}" deleted.`);
    }
  };

  // QR Scanner handlers
  const handleQRScan = (qrData) => {
    console.log('QR Code scanned:', qrData);
    setShowCamera(false);

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (e) {
      alert('Invalid QR code format. Please use a JSON-based QR sticker.');
      console.error('QR parse error:', e);
      return;
    }

    if (!parsed.name || !parsed.status) {
      alert('QR code missing required fields (name/status).');
      return;
    }

    if (parsed.status.toLowerCase() === 'borrowed') {
      setProductStatus('borrowed');
      setScannedProduct({
        name: parsed.name,
        borrower: parsed.borrower || 'Unknown',
        borrowDate: parsed.borrowDate || 'Unknown',
        returnDate: parsed.returnDate || 'Unknown',
        qrCode: qrData
      });
    } else if (parsed.status.toLowerCase() === 'available') {
      setProductStatus('available');
      setScannedProduct({
        name: parsed.name,
        qrCode: qrData
      });
    } else {
      alert(`Unknown product status: ${parsed.status}`);
    }
  };

  const handleReturn = () => {
    const currentDate = getCurrentDate();
    console.log('Returning product:', scannedProduct, 'on', currentDate);
    alert(`Product returned successfully!\nReturn date: ${currentDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  const handleBorrow = (borrowData) => {
    console.log('Borrowing product:', scannedProduct);
    console.log('Borrow data:', borrowData);
    alert(`Product borrowed successfully!\nBorrower: ${borrowData.borrowerName}\nBorrow date: ${borrowData.borrowDate}\nReturn by: ${borrowData.returnDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  // Tab configuration
  // Admin & teacher → kamera on lisätty palautettuun JSX:iin
  // Student → EI kamera-tabia
  const tabs = ['history', 'products'];

  if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
    tabs.push('users');
  }
  if (isMobile) {
    tabs.push('settings');
  }

  const tabIconMap = {
    camera: ScanQrCode,
    users: Users,
    products: Package,
    history: History,
    settings: Settings
  };

  const renderTabIcon = (tab) => {
    const IconComponent = tabIconMap[tab];
    if (!IconComponent) {
      return null;
    }
    const isCamera = tab === 'camera';

    return (
      <IconComponent
        size={isCamera ? 28 : 22}
        strokeWidth={isCamera ? 2.6 : 2.2}
        aria-hidden="true"
      />
    );
  };

  const getTabLabel = (tab, forMobile = false) => {
    switch (tab) {
      case 'camera': return 'Camera';
      case 'users': return 'Users';
      case 'products': return 'Products';
      case 'history': return forMobile ? 'History' : 'Borrowing History';
      case 'settings': return 'Settings';
      default: return tab;
    }
  };

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Password handlers
  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Please fill in all fields before submitting.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setPasswordStatus({ type: 'success', message: 'Password change request submitted. (Demo only)' });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Check if user is admin or teacher
  const canAccessBorrow = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Render camera view content
  const renderCameraView = () => (
    <div className="borrow-content">
      {currentUser?.role !== 'student' && (
        <button
          onClick={() => setShowCamera(true)}
          className="scan-button"
        >
          SCAN QR CODE
        </button>
      )}

      {currentUser?.role !== 'student' && (
        <p className="help-text">
          Press the button to scan a product QR code
        </p>
      )}

      {/* Mobile Product Info Box */}
      {scannedProduct && (
        <div className="mobile-product-box">
          <h3 className="mobile-product-title">{scannedProduct.name}</h3>
          <div className="mobile-product-status">
            {productStatus === 'borrowed' ? 'Lainassa' : 'Vapaa'}
          </div>

          {productStatus === 'borrowed' ? (
            <>
              <div className="mobile-info-section">
                <p className="mobile-label">Lainaataan:</p>
                <p className="mobile-value">Nimi: {scannedProduct.borrower}</p>
                <p className="mobile-value">Pvm: {scannedProduct.borrowDate}</p>
              </div>
              <div className="mobile-info-section">
                <p className="mobile-label">Viimeinen palautuspäivä:</p>
                <p className="mobile-value">{scannedProduct.returnDate}</p>
              </div>
            </>
          ) : (
            <div className="mobile-info-section">
              <p className="mobile-label">Lainaataan:</p>
              <input
                type="text"
                placeholder="Nimi:"
                className="mobile-input"
                id="mobile-borrower-name"
              />
              <input
                type="tel"
                placeholder="Pvm:"
                className="mobile-input"
                id="mobile-borrower-phone"
              />
              <p className="mobile-label">Viimeinen palautuspäivä:</p>
              <input
                type="text"
                placeholder="dd.mm.yyyy"
                className="mobile-input"
                id="mobile-return-date"
              />
            </div>
          )}

          <button
            onClick={() => {
              if (productStatus === 'borrowed') {
                handleReturn();
              } else {
                const name = document.getElementById('mobile-borrower-name').value;
                const phone = document.getElementById('mobile-borrower-phone').value;
                const returnDate = document.getElementById('mobile-return-date').value;
                if (!name || !phone || !returnDate) {
                  alert('Fill in all fields!');
                  return;
                }
                handleBorrow({
                  borrowerName: name,
                  borrowerPhone: phone,
                  returnDate: returnDate,
                  borrowDate: getCurrentDate()
                });
              }
            }}
            className="mobile-action-button"
          >
            {productStatus === 'borrowed' ? 'Palauta' : 'Lainaa'}
          </button>
        </div>
      )}
    </div>
  );

  // Render mobile content for each tab
  const renderMobileContent = () => {
    if (activeTab === 'camera') {
      return renderCameraView();
    }

    if (activeTab === 'users' && currentUser?.role === 'admin') {
      return (
        <div className="mobile-tab-content">
          <div className="mobile-content-section">

            {/* Search Box */}
            <div className="user-search">
              <input
                placeholder="Search ..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <h2>Users Management</h2>

            <div style={{ height: '500px', width: '100%' }}>
              <Grid
                columns={['name', 'email', 'role']}
                data={getFilteredUsers()}
                allowEditing={true}
                allowDelete={true}
                onDeleteRow={handleDeleteUser}
                onDataChange={handleDataChange}
                pageSize={10}
                height="500px"
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'products') {
      return (
        <ProductsTab
          currentUser={currentUser}
          productsData={productsData}
          borrowingHistory={borrowingHistory}
          query={userQuery}
          onQueryChange={setUserQuery}
        />
      );
    }

    if (activeTab === 'history') {
      return (
        <div className="mobile-tab-content">
          <div className="mobile-content-section">

            {/* Search Box */}
            <div className="user-search">
              <input
                placeholder="Search ..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>

            <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>

            <div style={{ height: '500px', width: '100%' }}>
              <Grid
                columns={currentUser?.role === 'admin'
                  ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                  : ['productName', 'borrowedAt', 'returnedAt', 'status']}
                data={getFilteredHistory()}
                allowEditing={false}
                allowDelete={false}
                pageSize={10}
                height="500px"
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="mobile-tab-content">
          <div className="mobile-content-section">
            <div className="admin-settings">
              <div className="admin-settings-section">
                <h3>User Details</h3>
                <div className="settings-field">
                  <span className="settings-label">Name</span>
                  <span className="settings-value">{currentUser?.name || '-'}</span>
                </div>
                <div className="settings-field">
                  <span className="settings-label">Username</span>
                  <span className="settings-value">{currentUser?.username || '-'}</span>
                </div>
                <div className="settings-field">
                  <span className="settings-label">Role</span>
                  <span className="settings-value">{currentUser?.role || '-'}</span>
                </div>
              </div>

              <div className="admin-settings-section">
                <h3>Change Password</h3>
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                  <label className="password-form-field">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                  </label>
                  <label className="password-form-field">
                    <span>New password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </label>
                  <label className="password-form-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </label>

                  {passwordStatus && (
                    <div
                      className={`password-status ${passwordStatus.type === 'error' ? 'error' : 'success'}`}
                      role="alert"
                    >
                      {passwordStatus.message}
                    </div>
                  )}

                  <button type="submit" className="password-submit-btn">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="admin-settings-section">
                <h3>Account</h3>
                <button type="button" className="settings-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-logo-text">
          Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : <span className="hide-on-mobile"> - Admin Panel</span>}
        </h1>

        <div className="admin-header-actions">

          <span className="user-info mobile-header-user">
            Welcome, <strong>{currentUser?.username}</strong>
            <span className="admin-badge">({currentUser?.role})</span>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </span>

          {canAccessBorrow && (
            <button
              onClick={() => setShowCamera(true)}
              className="borrow-button hide-on-mobile"
            >
              <QrCode size={18} />
              Borrow/Return
            </button>
          )}

        </div>
      </div>

      {/* Mobile Content - Render based on active tab */}
      {isMobile && (
        <div key={activeTab}>
          {renderMobileContent()}
        </div>
      )}

      {showCamera && currentUser?.role !== 'student' && (
        <QRScannerCamera
          onScan={handleQRScan}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Product Modals - Desktop Only */}
      <div className="hide-on-mobile">
        {scannedProduct && productStatus === 'borrowed' && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button onClick={() => { setScannedProduct(null); setProductStatus(null); }} className="modal-close">×</button>
              <h2 className="modal-title">{scannedProduct.name}</h2>
              <div className="modal-status"><h3 className="status-borrowed">Borrowed</h3></div>
              <div className="modal-content">
                <p className="info-label">Borrowed by:</p>
                <p className="info-value">{scannedProduct.borrower}</p>
                <p className="info-value">{scannedProduct.borrowDate}</p>
                <p className="info-label">Return deadline:</p>
                <p className="info-value">{scannedProduct.returnDate}</p>
                <p className="info-label">Return date:</p>
                <div className="return-date-display">{getCurrentDate()}</div>
              </div>
              <button onClick={handleReturn} className="modal-action-btn">Return</button>
            </div>
          </div>
        )}

        {scannedProduct && productStatus === 'available' && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button onClick={() => { setScannedProduct(null); setProductStatus(null); }} className="modal-close">×</button>
              <h2 className="modal-title">{scannedProduct.name}</h2>
              <div className="modal-status"><h3 className="status-available">Available</h3></div>
              <div className="modal-content">
                <div className="info-input-wrapper">
                  <label className="info-label">Borrowing to:</label>
                  <input type="text" placeholder="Name:" className="info-input" id="desktop-borrower-name" />
                </div>
                <div className="info-input-wrapper">
                  <input type="tel" placeholder="Phone:" className="info-input" id="desktop-borrower-phone" />
                </div>
                <div className="info-input-wrapper">
                  <label className="info-label">Return deadline:</label>
                  <input type="text" placeholder="dd.mm.yyyy" className="info-input" id="desktop-return-date" />
                </div>
              </div>
              <button
                onClick={() => {
                  const borrowerName = document.getElementById('desktop-borrower-name').value;
                  const borrowerPhone = document.getElementById('desktop-borrower-phone').value;
                  const returnDate = document.getElementById('desktop-return-date').value;
                  if (!borrowerName || !borrowerPhone || !returnDate) {
                    alert('Fill in all fields!');
                    return;
                  }
                  handleBorrow({
                    borrowerName,
                    borrowerPhone,
                    returnDate,
                    borrowDate: getCurrentDate()
                  });
                }}
                className="modal-action-btn"
              >
                Borrow
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Desktop */}
      {!isMobile && (
        <div className="admin-tabs" role="tablist">
          <div className="admin-tab-list">
            {tabs.map(tab => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={[
                    'admin-tab-button',
                    isActive ? 'active' : ''
                  ].join(' ').trim()}
                  role="tab"
                  aria-selected={isActive}
                >
                  {getTabLabel(tab)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Content Area */}
      <div className="admin-content hide-on-mobile">
        <div className="admin-content-card">

          {/* Search Box for Users */}
          {activeTab !== 'settings' && (
            <div className="user-search">
              <input
                placeholder="Search ..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <div>
              <h2>Users Management</h2>
              <ServerGrid
                columns={['first_name', 'last_name', 'email', 'role']}
                path="users"
                allowEditing={true}
                allowDelete={true}
                onDeleteRow={handleDeleteUser}
                onDataChange={handleDataChange}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'products' && currentUser?.role === 'admin' && (
            <ProductsTab
              currentUser={currentUser}
              productsData={productsData}
              borrowingHistory={borrowingHistory}
              query={userQuery}
              onQueryChange={setUserQuery}
            />
          )}

          {activeTab === 'history' && (
            <div>
              <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
              <Grid
                columns={currentUser?.role === 'admin'
                  ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                  : ['productName', 'borrowedAt', 'returnedAt', 'status']}
                data={getFilteredHistory()}
                allowEditing={false}
                allowDelete={false}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-settings">
              <div className="admin-settings-section">
                <h3>User Details</h3>
                <div className="settings-field">
                  <span className="settings-label">Name</span>
                  <span className="settings-value">{currentUser?.name || '-'}</span>
                </div>
                <div className="settings-field">
                  <span className="settings-label">Username</span>
                  <span className="settings-value">{currentUser?.username || '-'}</span>
                </div>
                <div className="settings-field">
                  <span className="settings-label">Role</span>
                  <span className="settings-value">{currentUser?.role || '-'}</span>
                </div>
              </div>

              <div className="admin-settings-section">
                <h3>Change Password</h3>
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                  <label className="password-form-field">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                  </label>
                  <label className="password-form-field">
                    <span>New password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </label>
                  <label className="password-form-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </label>

                  {passwordStatus && (
                    <div
                      className={`password-status ${passwordStatus.type === 'error' ? 'error' : 'success'}`}
                      role="alert"
                    >
                      {passwordStatus.message}
                    </div>
                  )}

                  <button type="submit" className="password-submit-btn">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="admin-settings-section">
                <h3>Account</h3>
                <button type="button" className="settings-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="admin-mobile-nav" aria-label="Navigation">

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            className="admin-mobile-nav__camera"
            onClick={() => {
              setActiveTab('camera');
              setShowCamera(true);
            }}
            aria-label="Open camera scanner"
          >
            <ScanQrCode className="admin-mobile-nav__camera-icon" />
          </button>
        )}
          {tabs.map(tab => (
            <button
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'admin-mobile-nav__cell',
                activeTab === tab ? 'is-active' : ''
              ].join(' ').trim()}
              aria-label={tab}
              key={tab}
            >
              {renderTabIcon(tab)}
            </button>))
          }
        </nav>
      )}

    </div >
  );
}
