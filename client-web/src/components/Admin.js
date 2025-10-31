import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Grid from './Grid';
import Products from './Products';

export default function Admin({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : '- Admin Panel'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, <strong>{currentUser?.name}</strong> ({currentUser?.role})</span>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#4b5563', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

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
      <div style={{ padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
