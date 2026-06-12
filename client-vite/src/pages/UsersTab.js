import React, { useState, useRef, useEffect } from 'react';
import ServerGrid from '../components/ServerGrid';
import MobileSearchToggle from '../components/MobileSearchToggle';
import { useNotification } from '../components/NotificationContext';
import DataSetView from '../components/DataSetView';
import GenericMobileCard from '../components/GenericMobileCard';
import ServerGridEditDialog from '../components/ServerGridEditDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchServerData } from '../components/serverGet';
import { getApiBase } from '../config';
import './Admin.css';

const SEARCH_DEBOUNCE_MS = 300;

function UserMobileCard({ data }) {
  return (
    <>
      <div className="mobile-card-header">
        <div className="mobile-card-title">
          {`${data.first_name || ''} ${data.last_name || ''}`.trim()}
        </div>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Email:</span>
        <span className="mobile-card-value" style={{ wordBreak: 'break-all' }}>{data.email}</span>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Role:</span>
        <span className="mobile-card-value" style={{ textTransform: 'capitalize' }}>{data.role}</span>
      </div>
    </>
  );
}

export default function UsersTab({
  currentUser,
  query,
  onQueryChange,
  onDeleteUser,
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const { showNotification } = useNotification();
  
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  // Reset input value when dialog closes to prevent Chrome autocomplete
  useEffect(() => {
    if (!editingUser && inputRef.current) {
      const val = inputRef.current.value;
      inputRef.current.value = '';
      inputRef.current.value = val;
    }
  }, [editingUser]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onQueryChange(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const transformEditPayload = (payload) => {
    const password = (payload.password || '').trim();
    const confirmPassword = (payload.confirmPassword || '').trim();
    const isAdmin = currentUser?.role === 'admin';

    if (!password && !confirmPassword) {
      const { password: _p, confirmPassword: _cp, ...restPayload } = payload;
      return restPayload;
    }

    if (!password || !confirmPassword) {
      throw new Error('To change the password, fill both password fields.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (isAdmin) {
      const { confirmPassword: _cp, ...restPayload } = payload;
      return { ...restPayload, password };
    }
    throw new Error('You are not allowed to change this password.');
  };

  const transformAddPayload = (payload) => {
    const email = (payload.email || '').trim();
    const first = (payload.first_name || '').trim();
    const last = (payload.last_name || '').trim();
    const password = (payload.password || '').trim();
    const confirmPassword = (payload.confirmPassword || '').trim();
    const baseUser =
      email && email.includes('@')
        ? email.split('@')[0]
        : `${first}.${last}`.toLowerCase().replace(/\s+/g, '');

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        throw new Error('Please fill both password fields or leave both empty');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
    }

    const payloadOut = {
      username: baseUser,
      first_name: first,
      last_name: last,
      email,
      role: payload.role || 'student',
      phone_number: null,
    };

    if (password) {
      payloadOut.password = password;
    }

    return payloadOut;
  };

  const loadUsersPage = async (page, limit = 10) => {
    const { rows } = await fetchServerData('users', page, inputValue, limit);
    return rows;
  };

  const handleSaveEditMobile = async () => {
    if (!editingUser) return;
    try {
      const finalPayload = transformEditPayload(editingUser);
      const res = await fetch(`${getApiBase()}/api/users/${editingUser.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update user');
      }

      setEditingUser(null);
      setRefreshKey(k => k + 1);
      showNotification('User updated successfully!', 'success');
    } catch (err) {
      console.error('Edit error:', err);
      showNotification(err.message || 'Failed to update user', 'error');
    }
  };

  const handleDeleteMobile = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/users/${deletingUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to delete user');
      }

      setDeletingUser(null);
      setRefreshKey(k => k + 1);
      showNotification('User deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Mobile view */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section mobile-history-section">
          <h2>Users</h2>
          <MobileSearchToggle
            value={inputValue}
            onChange={handleSearchChange}
          />
          <div style={{ width: '100%', padding: '1.5rem 12px 1.5rem' }}>
            <DataSetView
              key={`users-mobile-${refreshKey}-${inputValue}`}
              render={({ data }) => (
                <GenericMobileCard
                  onEdit={currentUser?.role === 'admin' ? () => setEditingUser(data) : undefined}
                  onDelete={currentUser?.role === 'admin' ? () => setDeletingUser(data) : undefined}
                >
                  <UserMobileCard data={data} />
                </GenericMobileCard>
              )}
              loadPage={loadUsersPage}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>Users Management</h2>

        <div className="products-card__search">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="2" />
              <line x1="15" y1="15" x2="20" y2="20" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input type="text" style={{display:'none'}} autoComplete="username" />
          <input type="password" style={{display:'none'}} autoComplete="current-password" />
          <input
            ref={inputRef}
            type="search"
            name="users-search"
            placeholder="Search ..."
            value={inputValue}
            onChange={handleSearchChange}
            autoComplete="off"
            readOnly
            onFocus={(e) => e.target.removeAttribute('readonly')}
          />
        </div>
        <ServerGrid
          key={refreshKey}
          columns={[
            {
              field: 'name',
              displayName: 'Name',
              valueGetter: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            },
            'email',
            'role',
          ]}
          path="users"
          allowEditing={true}
          allowDelete={true}
          pageSize={10}
          showAddButton={true}
          query={query}
          formComponent={UsersForm}
          transformEditPayload={transformEditPayload}
          transformAddPayload={transformAddPayload}
        />
      </div>

      {/* Mobile Modals */}
      {editingUser && (
        <ServerGridEditDialog
          isEditing={true}
          onCancel={() => setEditingUser(null)}
          onSave={handleSaveEditMobile}
          formComponent={<UsersForm data={editingUser} setData={setEditingUser} />}
        />
      )}

      {deletingUser && (
        <ConfirmDialog
          isOpen={!!deletingUser}
          title="Confirm deletion"
          message={`Are you sure you want to delete user "${deletingUser.first_name} ${deletingUser.last_name}"?`}
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          cancelLabel="Cancel"
          onCancel={() => !isDeleting && setDeletingUser(null)}
          onConfirm={handleDeleteMobile}
          isDestructive={true}
        />
      )}
    </>
  );
}

function UsersForm({ data, setData }) {
  const isEditing = !!(data && data.id);
  const getValue = (field) => (data && data[field]) || '';
  const handleChange = (field) => (e) =>
    setData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="add-product-form">
      <div className="add-product-form-grid">
        <div>
          <label className="form-label">First name *</label>
          <input
            type="text"
            className="form-input"
            autoComplete="new-password"
            value={getValue('first_name')}
            onChange={handleChange('first_name')}
          />
        </div>
        <div>
          <label className="form-label">Last name *</label>
          <input
            type="text"
            className="form-input"
            autoComplete="new-password"
            value={getValue('last_name')}
            onChange={handleChange('last_name')}
          />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            autoComplete="new-password"
            value={getValue('email')}
            onChange={handleChange('email')}
          />
        </div>
        <div>
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={getValue('role') || 'student'}
            onChange={handleChange('role')}
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        {!isEditing && (
          <>
            <div>
              <label className="form-label">Password (optional)</label>
              <input
                type="password"
                className="form-input"
                autoComplete="new-password"
                value={getValue('password')}
                onChange={handleChange('password')}
              />
            </div>
            <div>
              <label className="form-label">Confirm password (optional)</label>
              <input
                type="password"
                className="form-input"
                autoComplete="new-password"
                value={getValue('confirmPassword')}
                onChange={handleChange('confirmPassword')}
              />
            </div>
          </>
        )}

        {isEditing && (
          <>
            <div style={{ gridColumn: '1 / -1', fontSize: '0.875rem', color: '#6b7280' }}>
              Leave <strong>Password</strong> and <strong>Confirm password</strong> empty to keep the current password.
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                autoComplete="new-password"
                value={getValue('password')}
                onChange={handleChange('password')}
                placeholder="New password (optional)"
              />
            </div>
            <div>
              <label className="form-label">Confirm password</label>
              <input
                type="password"
                className="form-input"
                autoComplete="new-password"
                value={getValue('confirmPassword')}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm new password"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}