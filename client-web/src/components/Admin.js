import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import QRScannerCamera from './QRScannerCamera';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';
import { getCurrentDate } from '../utils/dateUtils';
import CameraView from './CameraView';
import SearchBox from './SearchBox';
import SettingsTab from './SettingsTab';
import AdminHeader from './AdminHeader';
import ProductModals from './ProductModals';
import AdminTabs from './AdminTabs';
import AdminMobileNav from './AdminMobileNav';
import { useHistoryFilter } from '../hooks/useHistoryFilter';
import { useQRScanner } from '../hooks/useQRScanner';
import ProductsTab from './ProductsTab';
import UsersTab from './UsersTab';
import { TabConfig } from '../utils/tabConfig';

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');

  // QR Scanner hook
  const {
    showCamera,
    setShowCamera,
    scannedProduct,
    productStatus,
    handleQRScan,
    handleReturn,
    handleBorrow,
    handleClose
  } = useQRScanner();

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

  const [borrowingHistory, setBorrowingHistory] = useState([
    { id: 1, userName: 'Mikko', productName: 'Laptop Dell XPS', borrowedAt: '2024-01-15', returnedAt: '2024-01-20', status: 'Returned', userId: 2 },
    { id: 2, userName: 'Ville', productName: 'Monitor Samsung', borrowedAt: '2024-01-18', returnedAt: null, status: 'On Loan', userId: 3 },
    { id: 3, userName: 'Aino', productName: 'Keyboard Mechanical', borrowedAt: '2024-01-10', returnedAt: '2024-01-17', status: 'Returned', userId: 5 },
    { id: 4, userName: 'Mikko', productName: 'Headphones Sony', borrowedAt: '2024-01-22', returnedAt: null, status: 'On Loan', userId: 2 },
  ]);



  // Custom hooks for data filtering
  const { filteredHistory } = useHistoryFilter(borrowingHistory, currentUser, userQuery);

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
    if (activeTab === 'history') setBorrowingHistory(updatedData);
  };



  const handleDeleteUser = (row) => {
    if (row.first_name && row.last_name) {
      const fullName = `${row.first_name} ${row.last_name}`;
      if (fullName === currentUser?.name || `${row.first_name}${row.last_name}` === currentUser?.name) {
        alert("You cannot delete your own account!");
        return;
      }
      if (window.confirm(`Are you sure you want to delete user "${fullName}"?`)) {
        // ServerGrid handles the actual deletion via API
        alert(`User "${fullName}" deleted.`);
      }
    } else if (row.name === currentUser?.name) {
      alert("You cannot delete your own account!");
      return;
    } else if (window.confirm(`Are you sure you want to delete user "${row.name || row.email}"?`)) {
      // ServerGrid handles the actual deletion via API
      alert(`User "${row.name || row.email}" deleted.`);
    }
  };

  // Tab configuration - using utility module
  const tabs = TabConfig.getTabs(currentUser, isMobile);

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

  // Render camera view content
  
  // Render mobile content for each tab
  const renderMobileContent = () => {
    if (activeTab === 'camera') {
      return (
        <CameraView
          currentUser={currentUser}
          onScanClick={() => setShowCamera(true)}
          scannedProduct={scannedProduct}
          productStatus={productStatus}
          onReturn={handleReturn}
          onBorrow={handleBorrow}
        />
      );
    }

    if (activeTab === 'users' && currentUser?.role === 'admin') {
      return (
        <UsersTab
          currentUser={currentUser}
          query={userQuery}
          onQueryChange={setUserQuery}
          onDeleteUser={handleDeleteUser}
          onDataChange={handleDataChange}
        />
      );
    }

    if (activeTab === 'products') {
      return (
        <div className="mobile-tab-content">
          <div className="mobile-content-section">
            {/* Search Box */}
            <SearchBox
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />

            <Products
              currentUser={currentUser}
              borrowingHistory={borrowingHistory}
              productsData={productsData}
              query={userQuery}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 'history') {
      return (
        <div className="mobile-tab-content">
          <div className="mobile-content-section">

            {/* Search Box */}
            <SearchBox
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />

            <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>

            <div style={{ height: '500px', width: '100%' }}>
              <Grid
                columns={currentUser?.role === 'admin'
                  ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                  : ['productName', 'borrowedAt', 'returnedAt', 'status']}
                data={filteredHistory}
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
            <SettingsTab
              currentUser={currentUser}
              passwordForm={passwordForm}
              passwordStatus={passwordStatus}
              onPasswordInputChange={handlePasswordInputChange}
              onPasswordSubmit={handlePasswordSubmit}
              onLogout={handleLogout}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <AdminHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onBorrowClick={() => setShowCamera(true)}
      />

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
      <ProductModals
        scannedProduct={scannedProduct}
        productStatus={productStatus}
        onClose={handleClose}
        onReturn={handleReturn}
        onBorrow={handleBorrow}
        getCurrentDate={getCurrentDate}
      />

      {/* Tabs - Desktop */}
      {!isMobile && (
        <AdminTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          getTabLabel={TabConfig.getTabLabel}
          renderTabIcon={TabConfig.renderTabIcon}
        />
      )}

      {/* Desktop Content Area */}
      <div className="admin-content hide-on-mobile">
        <div className="admin-content-card">

          {/* Search Box for Users */}
          {activeTab !== 'settings' && (
            <SearchBox
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          )}

          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <UsersTab
              currentUser={currentUser}
              query={userQuery}
              onQueryChange={setUserQuery}
              onDeleteUser={handleDeleteUser}
              onDataChange={handleDataChange}
            />
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
                data={filteredHistory}
                allowEditing={false}
                allowDelete={false}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              passwordForm={passwordForm}
              passwordStatus={passwordStatus}
              onPasswordInputChange={handlePasswordInputChange}
              onPasswordSubmit={handlePasswordSubmit}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <AdminMobileNav
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          onCameraClick={() => {
            setActiveTab('camera');
            setShowCamera(true);
          }}
          currentUser={currentUser}
        />
      )}

    </div >
  );
}
