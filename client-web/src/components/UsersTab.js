import React from 'react';
import Grid from './Grid';
import ServerGrid from './ServerGrid';
import './Admin.css';

/**
 * UsersTab component
 * 
 * Extracted from Admin.js - handles both mobile and desktop user management views
 * 
 * Props:
 * - currentUser: Current logged in user object
 * - users: Array of user objects to display
 * - query: Search query string
 * - onQueryChange: Callback function for search query changes
 * - onDeleteUser: Callback function for deleting a user
 * - onDataChange: Callback function for data updates
 * - isMobile: Boolean indicating if mobile view should be rendered
 */
export default function UsersTab({
  currentUser,
  users,
  query,
  onQueryChange,
  onDeleteUser,
  onDataChange,
  isMobile = false
}) {
  // Mobile view (originally lines 425-454)
  if (isMobile) {
    return (
      <div className="mobile-tab-content">
        <div className="mobile-content-section">
          {/* Search Box */}
          <div className="user-search">
            <input
              placeholder="Search ..."
              value={query || ''}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <h2>Users Management</h2>

          <div style={{ height: '500px', width: '100%' }}>
            <Grid
              columns={['name', 'email', 'role']}
              data={users}
              allowEditing={true}
              allowDelete={true}
              onDeleteRow={onDeleteUser}
              onDataChange={onDataChange}
              pageSize={10}
              height="500px"
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop view (originally lines 753-766)
  return (
    <div>
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
  );
}
