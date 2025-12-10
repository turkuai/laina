// src/components/Admin.js
import React, { useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
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

// ---------- STATIC DEMO DATA (no React state) ----------
const DEMO_BORROWING_HISTORY = [
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
];

// ---------- STATIC HELPERS (module scope) ----------

const TAB_ICON_MAP = {
  camera: Camera,
  users: Users,
  products: Package,
  history: HistoryIcon,
  settings: Settings,
};

function getTabsForRole(role) {
  if (role === 'admin' || role === 'teacher') {
    return ['camera', 'users', 'products', 'history', 'settings'];
  }
  return ['history', 'my-history', 'products', 'settings'];
}

function getTabLabel(tab, forMobile = false) {
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
}

function tabToPath(tab) {
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
}

function getActiveTabFromPath(pathname) {
  if (pathname.startsWith('/lend')) return 'camera';
  if (pathname.startsWith('/users')) return 'users';
  if (pathname.startsWith('/products')) return 'products';
  if (pathname.startsWith('/my-history')) return 'my-history';
  if (pathname.startsWith('/history') || pathname === '/') return 'history';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'history';
}

// ---------- ROOT LAYOUT COMPONENT (header, tabs, outlet) ----------

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(
    () => getTabsForRole(currentUser?.role),
    [currentUser?.role]
  );

  const activeTab = useMemo(
    () => getActiveTabFromPath(location.pathname),
    [location.pathname]
  );

  const canAccessBorrow =
    currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderTabIcon = (tab) => {
    const IconComponent = TAB_ICON_MAP[tab];
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

      {/* Tabs (desktop) – visibility controlled by CSS media queries */}
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

      {/* Content */}
      <div className="admin-content">
        <div className="admin-content-card">
          {/* Nested route content */}
          <Outlet />
        </div>
      </div>

      {/* Bottom tabs (mobile) – show/hide via CSS media queries */}
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
    </div>
  );
}

// ---------- TAB COMPONENTS ----------

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
  const { currentUser } = useAuth();

  return (
    <Products
      currentUser={currentUser}
      borrowingHistory={DEMO_BORROWING_HISTORY}
    />
  );
}

// /history – all or my history depending on role
export function HistoryTab() {
  const { currentUser } = useAuth();

  const data =
    currentUser?.role === 'admin'
      ? DEMO_BORROWING_HISTORY
      : DEMO_BORROWING_HISTORY.filter((r) => r.userId === currentUser?.id);

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
  const { currentUser } = useAuth();

  const data = DEMO_BORROWING_HISTORY.filter(
    (r) => r.userId === currentUser?.id
  );

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
