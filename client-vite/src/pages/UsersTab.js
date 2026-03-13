import React, { useState, useRef, useEffect } from 'react';
import ServerGrid from '../components/ServerGrid';
import MobileSearchToggle from '../components/MobileSearchToggle';
import { useNotification } from '../components/NotificationContext';
import './Admin.css';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * UsersTab component
 * 
 * Extracted from Admin.js - handles both mobile and desktop user management views
 * Uses CSS classes for responsive visibility instead of conditional rendering
 * Search is debounced: waits 300ms after last keystroke before triggering the API.
 * 
 * Props:
 * - currentUser: Current logged in user object
 * - query: Search query string (debounced value used for API)
 * - onQueryChange: Callback function for search query changes
 * - onDeleteUser: Callback function for deleting a user
 */
export default function UsersTab({
  currentUser,
  query,
  onQueryChange,
  onDeleteUser,
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [inputValue, setInputValue] = useState(query || '');
  const debounceRef = useRef(null);
  const { showNotification } = useNotification();

  // Sync input from parent query (e.g. when debounced update lands or initial load)
  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  // Debounce: only call onQueryChange 300ms after last keystroke
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

  return (
    <>
      {/* Mobile view - same ServerGrid and add popup as desktop (all fields: first_name, last_name, email, role) */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section">
          <h2>Users</h2>
          <MobileSearchToggle
            value={inputValue}
            onChange={handleSearchChange}
          />
          <div style={{ height: '500px', width: '100%' }}>
            <ServerGrid
              key={refreshKey}
              columns={[
                {
                  field: 'name',
                  displayName: 'Name',
                  valueGetter: (row) =>
                    `${row.first_name || ''} ${row.last_name || ''}`.trim(),
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
              transformAddPayload={(payload) => {
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

                // Only send password when admin actually set one; otherwise backend will generate it
                if (password) {
                  payloadOut.password = password;
                }

                return payloadOut;
              }}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>Users Management</h2>

        {/* Match Products search bar layout (title, then search) */}
        <div className="products-card__search">
          <span className="search-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="#6b7280"
                strokeWidth="2"
              />
              <line
                x1="15"
                y1="15"
                x2="20"
                y2="20"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search ..."
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
        <ServerGrid
          key={refreshKey}
          columns={[
            {
              field: 'name',
              displayName: 'Name',
              valueGetter: (row) =>
                `${row.first_name || ''} ${row.last_name || ''}`.trim(),
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
          transformAddPayload={(payload) => {
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
          }}
        />
      </div>

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
            value={getValue('first_name')}
            onChange={handleChange('first_name')}
          />
        </div>
        <div>
          <label className="form-label">Last name *</label>
          <input
            type="text"
            className="form-input"
            value={getValue('last_name')}
            onChange={handleChange('last_name')}
          />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
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
                value={getValue('password')}
                onChange={handleChange('password')}
              />
            </div>
            <div>
              <label className="form-label">Confirm password (optional)</label>
              <input
                type="password"
                className="form-input"
                value={getValue('confirmPassword')}
                onChange={handleChange('confirmPassword')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
