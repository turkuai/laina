import React from 'react';
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
              columns={['first_name', 'last_name', 'email']}
              path="users"
              allowEditing={true}
              allowDelete={true}
              onDeleteRow={onDeleteUser}
              onDataChange={onDataChange}
              pageSize={10}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>Users Management</h2>
        <ServerGrid
          columns={['first_name', 'last_name', 'email', 'role']}
          path="users"
          allowEditing={true}
          allowDelete={true}
          onDeleteRow={onDeleteUser}
          onDataChange={onDataChange}
          pageSize={10}
        />
      </div>
    </>
  );
}
