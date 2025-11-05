import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';

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
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
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
            Welcome, <strong>{currentUser?.username}</strong>
            {currentUser?.role === 'admin' && (
              <span className="admin-badge">Admin</span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        <div className="admin-content-card">
          <h2>Users Management</h2>
          
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