import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, History, Package, QrCode, Settings, Users } from 'lucide-react';
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

  const baseTabs = currentUser?.role === 'admin'
    ? ['camera', 'users', 'products', 'history']
    : ['history', 'products'];
  const tabs = isMobile ? [...baseTabs, 'settings'] : baseTabs;

  const tabIconMap = {
    camera: Camera,
    users: Users,
    products: Package,
    history: History,
    settings: Settings
  };

  const renderTabIcon = (tab) => {
    const IconComponent = tabIconMap[tab];
    if (!IconComponent) return null;
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

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : '- Admin Panel'}
        </h1>
        <h1>Borrowing System - Admin Panel</h1>
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
                columns={['first_name', 'email', 'role']}
                path="/users"
                allowEditing={true}
                allowDelete={true}
                pageSize={10}
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
              aria-label={getTabLabel(tab, true)}
              onClick={() => handleTabClick(tab)}
            >
              <span className="sr-only">{getTabLabel(tab, true)}</span>
              <span className="bottom-tab-icon">
                {renderTabIcon(tab)}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
