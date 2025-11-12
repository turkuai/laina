import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import BorrowPage from './BorrowPage';

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');

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
              onClick={() => navigate('/borrow')}
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

      {/* Borrow button on mobile */}
      <div className="borrow-content-button hide-on-desktop">
        <BorrowPage />
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
