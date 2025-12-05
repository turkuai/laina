import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import ServerGrid from './ServerGrid';

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const [activeTab, setActiveTab] = useState(
    currentUser?.role === 'admin' ? 'users' : 'history'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const baseTabs = currentUser?.role === 'admin'
    ? ['camera', 'users', 'products', 'history']
    : ['history', 'products'];
  const tabs = isMobile ? [...baseTabs, 'settings'] : baseTabs;

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

  const handleTabClick = (tab) => {
    if (tab === 'camera') {
      navigate('/borrow');
      return;
    }
    setActiveTab(tab);
  };

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

  // Determine the columns to show based on user role
  const getHistoryColumns = () => {
    if (currentUser?.role === 'admin') {
      return ['product_name', 'borrower_name', 'lender_name', 'borrow_date', 'estimated_return_date', 'actual_return_date', 'status'];
    } else {
      // For students, don't show borrower_name since they only see their own records
      return ['product_name', 'lender_name', 'borrow_date', 'estimated_return_date', 'actual_return_date', 'status'];
    }
  };

  // Construct the API path with borrower filter for students
  const getHistoryPath = () => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
      return 'borrowing-history';
    } else {
      // Filter by current user's ID for students
      return `borrowing-history?borrower_id=${currentUser?.id}`;
    }
  };

  // Get products columns
  const getProductsColumns = () => {
    return ['product_name', 'type_name', 'purchase_date', 'location_name', 'status', 'details'];
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : '- Admin Panel'}
        </h1>
        <div className="admin-header-actions">
          {canAccessBorrow && (
            <button
              onClick={() => navigate('/borrow')}
              className="borrow-button"
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

      {/* Tabs */}
      {!isMobile && (
        <div className="admin-tabs" role="tablist">
          <div className="admin-tab-list">
            {tabs.map(tab => {
              const isCameraTab = tab === 'camera';
              const isActive = !isCameraTab && activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={[
                    'admin-tab-button',
                    isCameraTab ? 'camera-tab' : '',
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

      {/* Content */}
      <div className="admin-content">
        <div className="admin-content-card">

          {/* Search Box */}
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
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2>Products Management</h2>
              <ServerGrid
                columns={getProductsColumns()}
                path="products"
                allowEditing={currentUser?.role === 'admin'}
                allowDelete={currentUser?.role === 'admin'}
                pageSize={10}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
              <ServerGrid
                columns={getHistoryColumns()}
                path={getHistoryPath()}
                allowEditing={false}
                allowDelete={currentUser?.role === 'admin'}
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
      {isMobile && (
        <nav className="bottom-tab-bar" aria-label="Bottom navigation">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={[
                'bottom-tab-button',
                tab === 'camera' ? 'camera-tab' : '',
                tab !== 'camera' && activeTab === tab ? 'active' : ''
              ].join(' ').trim()}
              onClick={() => handleTabClick(tab)}
            >
              <span>{getTabLabel(tab, true)}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
