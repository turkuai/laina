// src/components/Admin.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  useNavigate,
  useLocation,
  Outlet,
  useOutletContext,
  NavLink,
} from 'react-router-dom';
import {
  Camera,
  History as HistoryIcon,
  Package,
  QrCode,
  Settings,
  Users,
} from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import ServerGrid from './ServerGrid';

// ---------- LAYOUT COMPONENT (header, footer, tabs, context) ----------
export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userQuery, setUserQuery] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  // demo data – in real app you’ll fetch from API
  const [users] = useState([
    { id: 2, name: 'Mikko', email: 'mikko@example.com', role: 'student' },
    { id: 3, name: 'Ville', email: 'ville@example.com', role: 'student' },
    { id: 5, name: 'Aino', email: 'aino@example.com', role: 'student' },
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  ]);

  const [borrowingHistory, setBorrowingHistory] = useState([
    {
      id: 1,
      userName: 'Mikko',
      productName: 'Laptop Dell XPS',
      borrowedAt: '2024-01-15',
      returnedAt: '2024-01-20',
      status: 'Returned',
      userId: 2,
    },
    {
      id: 2,
      userName: 'Ville',
      productName: 'Monitor Samsung',
      borrowedAt: '2024-01-18',
      returnedAt: null,
      status: 'On Loan',
      userId: 3,
    },
    {
      id: 3,
      userName: 'Aino',
      productName: 'Keyboard Mechanical',
      borrowedAt: '2024-01-10',
      returnedAt: '2024-01-17',
      status: 'Returned',
      userId: 5,
    },
    {
      id: 4,
      userName: 'Mikko',
      productName: 'Headphones Sony',
      borrowedAt: '2024-01-22',
      returnedAt: null,
      status: 'On Loan',
      userId: 2,
    },
  ]);

  // --------- helpers for history ----------
  const getBorrowingHistoryForCurrentUser = () => {
    if (currentUser?.role === 'admin') return borrowingHistory;
    return borrowingHistory.filter((r) => r.userId === currentUser?.id);
  };

  const getMyBorrowingHistory = () =>
    borrowingHistory.filter((r) => r.userId === currentUser?.id);

  // --------- screen size ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --------- derive active tab from URL ----------
  const activeTab = useMemo(() => {
    const path = location.pathname; // e.g. "/", "/users", "/lend" ...

    if (path.startsWith('/lend')) return 'camera';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/products')) return 'products';
    if (path.startsWith('/my-history')) return 'my-history';
    if (path.startsWith('/history') || path === '/') return 'history';
    if (path.startsWith('/settings')) return 'settings';
    return 'history';
  }, [location.pathname]);

  // clear password status when leaving settings
  useEffect(() => {
    if (activeTab !== 'settings' && passwordStatus) {
      setPasswordStatus(null);
    }
  }, [activeTab, passwordStatus]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordStatus({
        type: 'error',
        message: 'Please fill in all fields before submitting.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    setPasswordStatus({
      type: 'success',
      message: 'Password change request submitted. (Demo only)',
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // who can use the borrow scanner
  const canAccessBorrow =
    currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // tabs per role – ALWAYS includes "settings" (desktop + mobile)
  const baseTabs =
    currentUser?.role === 'admin' || currentUser?.role === 'teacher'
      ? ['camera', 'users', 'products', 'history', 'settings']
      : ['history', 'my-history', 'products', 'settings'];

  const tabs = baseTabs;

  const tabIconMap = {
    camera: Camera,
    users: Users,
    products: Package,
    history: HistoryIcon,
    settings: Settings,
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
      case 'camera':
        return 'Camera';
      case 'users':
        return 'Users';
      case 'products':
        return 'Products';
      case 'history':
        return forMobile ? 'History' : 'Borrowing History';
      case 'my-history':
        return 'My History';
      case 'settings':
        return 'Settings';
      default:
        return tab;
    }
  };

  // IMPORTANT: these are **absolute** paths because Admin is mounted at "/"
  const tabToPath = (tab) => {
    switch (tab) {
      case 'camera':
        return '/lend';
      case 'users':
        return '/users';
      case 'products':
        return '/products';
      case 'history':
        return '/history';
      case 'my-history':
        return '/my-history';
      case 'settings':
        return '/settings';
      default:
        return '/history';
    }
  };

  // Value we pass down to the tab components
  const outletContextValue = {
    currentUser,
    users,
    borrowingHistory,
    setBorrowingHistory,
    productsData,
    userQuery,
    setUserQuery,
    passwordForm,
    handlePasswordInputChange,
    handlePasswordSubmit,
    passwordStatus,
    getBorrowingHistoryForCurrentUser,
    getMyBorrowingHistory,
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Borrowing System{' '}
          {currentUser?.role === 'student'
            ? '- My Dashboard'
            : '- Admin Panel'}
        </h1>
        <h1>Borrowing System - Admin Panel</h1>
        <div className="admin-header-actions">
          {canAccessBorrow && (
            <button
              onClick={() => navigate('/lend')}
              className="borrow-button"
            >
              <QrCode size={18} />
              Borrow/Return
            </button>
          )}
          <span className="user-info">
            Welcome, <strong>{currentUser?.username}</strong>
            <span className="admin-badge">({currentUser?.role})</span>
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs (desktop) – includes Settings */}
      {!isMobile && (
        <div className="admin-tabs" role="tablist">
          <div className="admin-tab-list">
            {tabs.map((tab) => {
              const isCameraTab = tab === 'camera';
              return (
                <NavLink
                  key={tab}
                  to={tabToPath(tab)}
                  className={({ isActive }) =>
                    [
                      'admin-tab-button',
                      isCameraTab ? 'camera-tab' : '',
                      !isCameraTab && isActive ? 'active' : '',
                    ]
                      .join(' ')
                      .trim()
                  }
                  role="tab"
                  aria-selected={activeTab === tab}
                >
                  {getTabLabel(tab)}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="admin-content">
        <div className="admin-content-card">
          {/* Search Box (hidden on settings tab) */}
          {activeTab !== 'settings' && (
            <div className="user-search">
              <input
                placeholder="Search ..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
          )}

          {/* Nested route content */}
          <Outlet context={outletContextValue} />
        </div>
      </div>

      {/* Bottom tabs (mobile) */}
      {isMobile && (
        <nav className="bottom-tab-bar" aria-label="Bottom navigation">
          {tabs.map((tab) => (
            <NavLink
              key={tab}
              to={tabToPath(tab)}
              className={({ isActive }) =>
                [
                  'bottom-tab-button',
                  tab === 'camera' ? 'camera-tab' : '',
                  tab !== 'camera' && isActive ? 'active' : '',
                ]
                  .join(' ')
                  .trim()
              }
              aria-label={getTabLabel(tab, true)}
            >
              <span className="sr-only">{getTabLabel(tab, true)}</span>
              <span className="bottom-tab-icon">{renderTabIcon(tab)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

// ---------- Hook for child tabs to read context ----------
function useAdminContext() {
  return useOutletContext();
}

// ---------- TAB COMPONENTS ----------

// /users
export function UsersTab() {
  const { currentUser } = useAuth();

  if (currentUser?.role !== 'admin') {
    return <p>You do not have access to this page.</p>;
  }

  return (
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
  );
}

// /products
export function ProductsTab() {
  const { currentUser, borrowingHistory, productsData } = useAdminContext();

  return (
    <Products
      currentUser={currentUser}
      borrowingHistory={borrowingHistory}
      productsData={productsData}
    />
  );
}

// /history – all or my history depending on role
export function HistoryTab() {
  const { currentUser, getBorrowingHistoryForCurrentUser } = useAdminContext();
  const data = getBorrowingHistoryForCurrentUser();

  return (
    <div>
      <h2>
        {currentUser?.role === 'admin'
          ? 'All Borrowing History'
          : 'My Borrowing History'}
      </h2>
      <Grid
        columns={
          currentUser?.role === 'admin'
            ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
            : ['productName', 'borrowedAt', 'returnedAt', 'status']
        }
        data={data}
        allowEditing={false}
        allowDelete={false}
        pageSize={10}
      />
    </div>
  );
}

// /my-history – always only current user
export function MyHistoryTab() {
  const { getMyBorrowingHistory } = useAdminContext();
  const data = getMyBorrowingHistory();

  return (
    <div>
      <h2>My Borrowing History</h2>
      <Grid
        columns={['productName', 'borrowedAt', 'returnedAt', 'status']}
        data={data}
        allowEditing={false}
        allowDelete={false}
        pageSize={10}
      />
    </div>
  );
}

// /settings
export function SettingsTab() {
  const {
    currentUser,
    passwordForm,
    handlePasswordInputChange,
    handlePasswordSubmit,
    passwordStatus,
  } = useAdminContext();

  return (
    <div className="admin-settings">
      <div className="admin-settings-section">
        <h3>User Details</h3>
        <div className="settings-field">
          <span className="settings-label">Name</span>
          <span className="settings-value">{currentUser?.name || '-'}</span>
        </div>
        <div className="settings-field">
          <span className="settings-label">Username</span>
          <span className="settings-value">
            {currentUser?.username || '-'}
          </span>
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
              onChange={(e) =>
                handlePasswordInputChange('currentPassword', e.target.value)
              }
              placeholder="Enter current password"
            />
          </label>
          <label className="password-form-field">
            <span>New password</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordInputChange('newPassword', e.target.value)
              }
              placeholder="Enter new password"
            />
          </label>
          <label className="password-form-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordInputChange('confirmPassword', e.target.value)
              }
              placeholder="Re-enter new password"
            />
          </label>

          {passwordStatus && (
            <div
              className={`password-status ${
                passwordStatus.type === 'error' ? 'error' : 'success'
              }`}
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
        {/* Extra account actions if you like */}
      </div>
    </div>
  );
}
