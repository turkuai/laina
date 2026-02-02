import React, { useState } from 'react';
import ServerGrid from './ServerGrid';
import SearchBox from './SearchBox';
import { useNotification } from './NotificationContext';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const { showNotification } = useNotification();

  return (
    <>
      {/* Mobile view - same ServerGrid and add popup as desktop (all fields: first_name, last_name, email, role) */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section">
          <h2>Users Management</h2>
          <SearchBox
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <div style={{ height: '500px', width: '100%' }}>
            <ServerGrid
              key={refreshKey}
              columns={['first_name', 'last_name', 'email', 'role']}
              path="users"
              allowEditing={true}
              allowDelete={true}
              onDeleteRow={onDeleteUser}
              onDataChange={onDataChange}
              pageSize={10}
              showAddButton={true}
              query={query}
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
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <ServerGrid
          key={refreshKey}
          columns={['first_name', 'last_name', 'email', 'role']}
          path="users"
          allowEditing={true}
          allowDelete={true}
          onDeleteRow={onDeleteUser}
          onDataChange={onDataChange}
          pageSize={10}
          showAddButton={true}
          query={query}
          formComponent={UsersForm}
        />
      </div>

    </>
  );
}



function UsersForm({ data, setData }) {
  return (
    <div>
      <h4>User name</h4>
      <h4>Add kevin username</h4>
    </div>
  );
}