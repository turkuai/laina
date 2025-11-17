import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import BorrowPage from './BorrowPage';
import QRScannerCamera from './QRScannerCamera';

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

// Product Modal - BORROWED (Lainassa)
const ProductModalBorrowed = ({ product, onClose, onReturn }) => {
  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close">
          ×
        </button>

        <h2 className="modal-title">{product.name}</h2>

        <div className="modal-status">
          <h3 className="status-borrowed">Borrowed</h3>
        </div>

        <div className="modal-content">
          <p className="info-label">Borrowed by:</p>
          <p className="info-value">{product.borrower}</p>
          <p className="info-value">{product.borrowDate}</p>
          
          <p className="info-label">Return deadline:</p>
          <p className="info-value">{product.returnDate}</p>
          
          <p className="info-label">Return date:</p>
          <div className="return-date-display">
            {getCurrentDate()}
          </div>
        </div>

        <button onClick={onReturn} className="modal-action-btn">
          Return
        </button>
      </div>
    </div>
  );
};

// Product Modal - AVAILABLE (Vapaa)
const ProductModalAvailable = ({ product, onClose, onBorrow }) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [returnDate, setReturnDate] = useState('');

  if (!product) return null;

  const handleBorrow = () => {
    if (!borrowerName || !borrowerPhone || !returnDate) {
      alert('Fill in all fields!');
      return;
    }
    onBorrow({ 
      borrowerName, 
      borrowerPhone, 
      returnDate,
      borrowDate: getCurrentDate()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close">
          ×
        </button>

        <h2 className="modal-title">{product.name}</h2>

        <div className="modal-status">
          <h3 className="status-available">Available</h3>
        </div>

        <div className="modal-content">
          <div className="info-input-wrapper">
            <label className="info-label">Borrowing to:</label>
            <input
              type="text"
              placeholder="Name:"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="info-input"
            />
          </div>
          
          <div className="info-input-wrapper">
            <input
              type="tel"
              placeholder="Phone:"
              value={borrowerPhone}
              onChange={(e) => setBorrowerPhone(e.target.value)}
              className="info-input"
            />
          </div>
          
          <div className="info-input-wrapper">
            <label className="info-label">Return deadline:</label>
            <input
              type="text"
              placeholder="dd.mm.yyyy"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="info-input"
            />
          </div>
        </div>

        <button onClick={handleBorrow} className="modal-action-btn">
          Borrow
        </button>
      </div>
    </div>
  );
};

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);

  const [activeTab, setActiveTab] = useState(
    currentUser?.role === 'admin' ? 'users' : 'history'
  );

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

  const getUserData = () => {
    if (currentUser?.role === 'admin') return users;
    return users.filter(u => u.id === currentUser?.id);
  };

  const getBorrowingHistory = () => {
    if (currentUser?.role === 'admin') return borrowingHistory;
    return borrowingHistory.filter(r => r.userId === currentUser?.id);
  };

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

  const tabs = currentUser?.role === 'admin' ? ['users', 'products', 'history'] : ['history', 'products'];
  const getTabLabel = (tab) => {
    switch (tab) {
      case 'users': return 'Users';
      case 'products': return 'Products';
      case 'history': return 'Borrowing History';
      default: return tab;
    }
  };

  // Check if user is admin or teacher
  const canAccessBorrow = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : <span className="hide-on-mobile"> - Admin Panel</span>}
        </h1>
        <div className="admin-header-actions">
          {canAccessBorrow && (
            <button
              onClick={() => setShowCamera(true)}
              className="borrow-button hide-on-mobile"
            >
              <QrCode size={18} />
              Borrow/Return
            </button>
          )}
          <span className="user-info">
            Welcome, <strong>{currentUser?.username}</strong><span className="admin-badge">({currentUser?.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Borrow Section */}
      <div className="hide-on-desktop">
        {/* Scan Button */}

              <div className="borrow-content">
        <button
          onClick={() => setShowCamera(true)}
          className="scan-button"
        >
          Scan QR Code
        </button>
        
        <p className="help-text">
          Press the button to scan a product QR code
        </p>
      </div>

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

      {showCamera && (
        <QRScannerCamera
          onScan={handleQRScan}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Product Modals - Desktop Only */}
      <div className="hide-on-mobile">
        {scannedProduct && productStatus === 'borrowed' && (
          <ProductModalBorrowed
            product={scannedProduct}
            onClose={() => {
              setScannedProduct(null);
              setProductStatus(null);
            }}
            onReturn={handleReturn}
          />
        )}

        {scannedProduct && productStatus === 'available' && (
          <ProductModalAvailable
            product={scannedProduct}
            onClose={() => {
              setScannedProduct(null);
              setProductStatus(null);
            }}
            onBorrow={handleBorrow}
          />
        )}
      </div>

      <div className="admin-content hide-on-mobile">

        {/* Tabs */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === tab ? '600' : '400',
                  cursor: 'pointer'
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="admin-content-card">

          {/* Search Box for Users */}
          <div className="user-search">
            <input
              placeholder="Search ..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>

          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <div>
              <h2>Users Management</h2>
              <Grid
                columns={['name', 'email', 'role']}
                data={getUserData()}
                allowEditing={true}
                allowDelete={true}
                pageSize={10}
                onDataChange={handleDataChange}
                onEditRow={handleEditRow}
                onDeleteRow={handleDeleteUser}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <Products
              currentUser={currentUser}
              borrowingHistory={borrowingHistory}
              productsData={productsData}
            />
          )}

          {activeTab === 'history' && (
            <div>
              <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
              <Grid
                columns={currentUser?.role === 'admin'
                  ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                  : ['productName', 'borrowedAt', 'returnedAt', 'status']}
                data={getBorrowingHistory()}
                allowEditing={false}
                allowDelete={false}
                pageSize={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
