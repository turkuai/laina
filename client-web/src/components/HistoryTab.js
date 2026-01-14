import React from 'react';
import Grid from './Grid';
import './Admin.css';

/**
 * HistoryTab
 *
 * Extracted from Admin.js (mobile + desktop history views).
 *
 * Props:
 * - currentUser
 * - history
 * - query
 * - onQueryChange
 */
export default function HistoryTab({ currentUser, history, query, onQueryChange }) {
  // Mirror Admin.js mobile breakpoint
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (isMobile) {
    return (
      <div className="mobile-tab-content">
        <div className="mobile-content-section">
          {/* Search Box */}
          <div className="user-search">
            <input
              placeholder="Search ..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>

          <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>

          <div style={{ height: '500px', width: '100%' }}>
            <Grid
              columns={currentUser?.role === 'admin'
                ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
                : ['productName', 'borrowedAt', 'returnedAt', 'status']}
              data={history}
              allowEditing={false}
              allowDelete={false}
              pageSize={10}
              height="500px"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
      <Grid
        columns={currentUser?.role === 'admin'
          ? ['userName', 'productName', 'borrowedAt', 'returnedAt', 'status']
          : ['productName', 'borrowedAt', 'returnedAt', 'status']}
        data={history}
        allowEditing={false}
        allowDelete={false}
        pageSize={10}
      />
    </div>
  );
}

