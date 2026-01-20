import React from 'react';
import ServerGrid from './ServerGrid';
import SearchBox from './SearchBox';
import './Admin.css';

/**
 * HistoryTab
 *
 * Extracted from Admin.js (mobile + desktop history views).
 * Uses CSS classes for responsive visibility instead of conditional rendering
 *
 * Props:
 * - currentUser: Current logged in user object
 * - query: Search query string
 * - onQueryChange: Callback function for search query changes
 */
export default function HistoryTab({ currentUser, query, onQueryChange }) {
  const adminColumns = ['borrower_name', 'product_name', 'borrow_date', 'estimated_return_date', 'actual_return_date', 'status'];
  const adminColumnsMobile = ['borrower_name', 'product_name', 'borrow_date', 'status'];
  const studentColumns = ['product_name', 'borrow_date', 'estimated_return_date', 'actual_return_date', 'status'];
  // Mobile students: compact, fixed grid (no status, just product + borrow + planned return)
  const studentColumnsMobile = ['product_name', 'borrow_date', 'estimated_return_date'];
  
  const desktopColumns = currentUser?.role === 'admin' ? adminColumns : studentColumns;
  const mobileColumns = currentUser?.role === 'admin' ? adminColumnsMobile : studentColumnsMobile;

  // For students, we need to filter by their borrower_id
  // The API endpoint handles this via query parameter or authentication
  const path = currentUser?.role === 'admin' 
    ? 'borrowing-history' 
    : `borrowing-history?borrower_id=${currentUser?.id}`;

  return (
    <>
      {/* Mobile view */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section">
          <SearchBox
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
          <div style={{ height: '500px', width: '100%' }}>
            <ServerGrid
              columns={mobileColumns}
              path={path}
              allowEditing={false}
              allowDelete={false}
              pageSize={10}
              showAddButton={false}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>{currentUser?.role === 'admin' ? 'All Borrowing History' : 'My Borrowing History'}</h2>
        <ServerGrid
          columns={desktopColumns}
          path={path}
          allowEditing={false}
          allowDelete={false}
          pageSize={10}
          showAddButton={false}
        />
      </div>
    </>
  );
}

