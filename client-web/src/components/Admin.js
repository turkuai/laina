import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Grid from './Grid';

// Sample borrowing history data
const allBorrowingHistory = [
  { 
    id: 1, 
    userId: 2, 
    userName: 'Mikko',
    productName: 'Laptop Dell XPS', 
    borrowedAt: '2025-10-20', 
    returnedAt: null, 
    status: 'active' 
  },
  { 
    id: 2, 
    userId: 2, 
    userName: 'Mikko',
    productName: 'Mouse Logitech', 
    borrowedAt: '2025-10-15', 
    returnedAt: '2025-10-25', 
    status: 'returned' 
  },
  { 
    id: 3, 
    userId: 3, 
    userName: 'Ville',
    productName: 'Monitor Samsung', 
    borrowedAt: '2025-10-18', 
    returnedAt: null, 
    status: 'active' 
  },
  { 
    id: 4, 
    userId: 3, 
    userName: 'Ville',
    productName: 'Keyboard Mechanical', 
    borrowedAt: '2025-10-10', 
    returnedAt: '2025-10-20', 
    status: 'returned' 
  },
  { 
    id: 5, 
    userId: 5, 
    userName: 'Aino',
    productName: 'Tablet iPad', 
    borrowedAt: '2025-10-22', 
    returnedAt: null, 
    status: 'active' 
  },
  { 
    id: 6, 
    userId: 2, 
    userName: 'Mikko',
    productName: 'Headphones Sony', 
    borrowedAt: '2025-09-05', 
    returnedAt: '2025-09-15', 
    status: 'returned' 
  },
];

const allUsers = [
  { id: 1, name: 'Admin User', email: 'admin@tai.fi', role: 'admin' },
  { id: 2, name: 'Mikko', email: 'mikko@tai.fi', role: 'student' },
  { id: 3, name: 'Ville', email: 'ville@tai.fi', role: 'student' },
  { id: 4, name: 'Sanna', email: 'sanna@tai.fi', role: 'teacher' },
  { id: 5, name: 'Aino', email: 'aino@tai.fi', role: 'student' },
];

export default function Admin() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'admin' ? 'users' : 'history');
  
  // Filter data based on user role
  const getUserData = () => {
    if (currentUser?.role === 'admin') {
      return allUsers;
    }
    // Students only see their own data
    return allUsers.filter(u => u.id === currentUser?.id);
  };

  const getBorrowingHistory = () => {
    if (currentUser?.role === 'admin') {
      // Admin sees all borrowing history
      return allBorrowingHistory;
    }
    // Students only see their own borrowing history
    return allBorrowingHistory.filter(record => record.userId === currentUser?.id);
  };

  const [users] = useState(getUserData());
  const [borrowingHistory] = useState(getBorrowingHistory());

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDataChange = (updatedData) => {
    console.log('Data updated:', updatedData);
  };

  const handleEditRow = (row) => {
    console.log('Edited row:', row);
  };

  const handleDeleteRow = (row) => {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      console.log('Deleted row:', row);
    }
  };

  // Determine what tabs to show based on role
  const tabs = currentUser?.role === 'admin' 
    ? ['users', 'history'] 
    : ['history'];

  const getTabLabel = (tab) => {
    switch(tab) {
      case 'users': return 'Users Management';
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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
          Borrowing System {currentUser?.role === 'student' ? '- My History' : '- Admin Panel'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Welcome, <strong style={{ color: '#1f2937' }}>{currentUser?.name || currentUser?.username}</strong>
            <span style={{
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: currentUser?.role === 'admin' ? '#dbeafe' : '#fef3c7',
              color: currentUser?.role === 'admin' ? '#1e40af' : '#92400e',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {currentUser?.role}
            </span>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs (only show if admin has multiple tabs) */}
      {tabs.length > 1 && (
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 2rem'
        }}>
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
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Users Management
              </h2>
              <Grid
                columns={['name', 'email', 'role']}
                data={users}
                allowEditing={true}
                pageSize={10}
                height="500px"
                onDataChange={handleDataChange}
                onEditRow={handleEditRow}
                onDeleteRow={handleDeleteRow}
                allowSelection={true}
              />
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                {currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}
              </h2>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                  {currentUser?.role === 'admin' 
                    ? `Showing all borrowing records (${borrowingHistory.length} total)`
                    : `Showing your borrowing records (${borrowingHistory.length} total)`
                  }
                </p>
              </div>
              <Grid
                columns={currentUser?.role === 'admin' 
                  ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                  : ['productName', 'borrowedAt', 'returnedAt', 'status']
                }
                data={borrowingHistory}
                allowEditing={false}
                pageSize={10}
                height="500px"
                onDataChange={handleDataChange}
                onEditRow={handleEditRow}
                onDeleteRow={currentUser?.role === 'admin' ? handleDeleteRow : undefined}
                allowSelection={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}