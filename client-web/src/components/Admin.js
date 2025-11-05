import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';

const initialData = [
  { id: 1, name: 'Mikko', email: 'mikko@tai.fi', role: 'admin' },
  { id: 2, name: 'Ville', email: 'ville@tai.fi', role: 'student' },
  { id: 3, name: 'Sanna', email: 'sanna@tai.fi', role: 'teacher' },
  { id: 4, name: 'Aino', email: 'aino@tai.fi', role: 'viewer' },
];

export default function Admin() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDataChange = (updatedData) => {
    console.log('Data updated:', updatedData);
    setData(updatedData);
  };

  const handleEditRow = (row) => {
    console.log('Edited row:', row);
  };

  const handleDeleteRow = (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
      const updated = data.filter((r) => r.id !== row.id);
      setData(updated);
      console.log('Deleted row:', row);
    }
  };

  // Check if user is admin or teacher
  const canAccessBorrow = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

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
          Borrowing System - Admin Panel
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {canAccessBorrow && (
            <button
              onClick={() => navigate('/borrow')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              <QrCode size={18} />
              Borrow/Return
            </button>
          )}
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Welcome, <strong style={{ color: '#1f2937' }}>{currentUser?.username}</strong>
            {currentUser?.role === 'admin' && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                Admin
              </span>
            )}
            {currentUser?.role === 'teacher' && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                Teacher
              </span>
            )}
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

      {/* Content Area */}
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
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
            data={data}
            allowEditing={true}
            pageSize={10}
            height="500px"
            onDataChange={handleDataChange}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
            allowSelection={true}
          />
          <Products/>
        </div>
      </div>
    </div>
  );
}
