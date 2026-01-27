import React, { useState } from 'react';
import ServerGrid from './ServerGrid';
import SearchBox from './SearchBox';
import './Admin.css';

/**
 * UsersTab component
 * 
 * Extracted from Admin.js - handles both mobile and desktop user management views
 * Uses CSS classes for responsive visibility instead of conditional rendering
 * 
 * Props:
 * - currentUser: Current logged in user object
 * - query: Search query string
 * - onQueryChange: Callback function for search query changes
 * - onDeleteUser: Callback function for deleting a user
 * - onDataChange: Callback function for data updates
 */
export default function UsersTab({
  currentUser,
  query,
  onQueryChange,
  onDeleteUser,
  onDataChange
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'student',
  });

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'student',
    });
  };

  const generateUsername = () => {
    if (formData.email.includes('@')) {
      return formData.email.split('@')[0];
    }
    const base = (formData.first_name + '.' + formData.last_name).toLowerCase();
    return base.replace(/\s+/g, '');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      alert('Please fill in first name, last name and email');
      return;
    }

    const username = generateUsername();
    const password = generatePassword();

    try {
      const payload = {
        username,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password,
        role: formData.role,
        phone_number: null,
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = 'Failed to add user';
        try {
          const data = await res.json();
          msg = data.error || data.message || msg;
        } catch (_) {
          // ignore
        }
        throw new Error(msg);
      }

      // Refresh grid
      setRefreshKey((k) => k + 1);
      handleCloseAddModal();
      alert(`User created.\nUsername: ${username}\nTemporary password: ${password}`);
    } catch (err) {
      console.error('Add user error:', err);
      alert(err.message || 'Failed to add user');
    }
  };

  return (
    <>
      {/* Mobile view */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section">
          <SearchBox
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <h2>Users Management</h2>
          <div style={{ height: '500px', width: '100%' }}>
            <ServerGrid
              key={refreshKey}
              columns={[
                { 
                  field: 'name', 
                  displayName: 'Name',
                  valueGetter: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim()
                },
                'email'
              ]}
              path="users"
              allowEditing={true}
              allowDelete={true}
              onDeleteRow={onDeleteUser}
              onDataChange={onDataChange}
              pageSize={10}
              onAdd={handleOpenAddModal}
              query={query}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>Users Management</h2>
        <ServerGrid
          key={refreshKey}
          columns={['first_name', 'last_name', 'email', 'role']}
          path="users"
          allowEditing={true}
          allowDelete={true}
          onDeleteRow={onDeleteUser}
          onDataChange={onDataChange}
          pageSize={10}
          onAdd={handleOpenAddModal}
          query={query}
        />
      </div>

      {showAddModal && (
        <div className="product-modal-overlay" onClick={handleCloseAddModal}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <button
              onClick={handleCloseAddModal}
              className="product-modal-close"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="product-modal-title">Add User</h2>

            <form onSubmit={handleSubmitUser} className="add-product-form">
              <div className="add-product-form-grid">
                <div>
                  <label className="form-label">First name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Last name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <button type="submit" className="form-add-btn">
                  Save user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
