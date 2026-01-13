import React from 'react';
import Grid from './Grid';
import ServerGrid from './ServerGrid';
import './Admin.css';

export default function UsersTab({ 
  currentUser, 
  users, 
  query, 
  onQueryChange, 
  onDeleteUser, 
  onDataChange,
  isMobile = false 
}) {
  // Filter users for mobile view based on query
  const getFilteredUsers = () => {
    if (!query || !query.trim()) return users;
    
    const searchQuery = query.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery) ||
      user.role?.toLowerCase().includes(searchQuery)
    );
  };

  if (isMobile) {
    // Mobile view 
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
              data={getFilteredUsers()}
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

  // Deskto view
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
