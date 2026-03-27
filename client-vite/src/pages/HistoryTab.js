import React from 'react';
import ServerGrid from '../components/ServerGrid';
import MobileSearchToggle from '../components/MobileSearchToggle';
import DataSetView from '../components/DataSetView';
import GenericMobileCard from '../components/GenericMobileCard';
import { fetchServerData } from '../components/serverGet';
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

  const loadHistoryPage = async (page, limit = 10) => {
    const { rows } = await fetchServerData(path, page, query, limit);
    return rows;
  };

  return (
    <>
      {/* Mobile view */}
      <div className="mobile-tab-content hide-on-desktop">
        <div className="mobile-content-section mobile-history-section">
          <h2>Borrowing History</h2>
          <MobileSearchToggle
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
          />

          <div style={{ width: '100%', padding: '1.5rem 12px 1.5rem' }}>
            <DataSetView
              key={`${path}-${query || ''}`}
              render={({ data }) => (
                <GenericMobileCard>
                  <HistoryRow data={data} />
                </GenericMobileCard>
              )}
              loadPage={loadHistoryPage}
            />
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hide-on-mobile">
        <h2>Borrowing History</h2>

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
          columns={desktopColumns}
          path={path}
          allowEditing={false}
          allowDelete={false}
          pageSize={10}
          showAddButton={false}
          query={query}
        />
      </div>
    </>
  );
}

function HistoryRow({ data }) {
  return (
    <>
      <div className="generic-mobile-card-header">
        <div className="generic-mobile-card-title">
          {data.product_name || 'Unknown product'}
        </div>
        <div className="generic-mobile-card-status">
          <span className={`status-badge status-${data.status || 'unknown'}`}>
            {data.status || 'unknown'}
          </span>
        </div>
      </div>
      <div className="generic-mobile-card-row">
        <span className="generic-mobile-card-label">Borrower:</span>
        <span className="generic-mobile-card-value">
          {data.borrower_name || 'N/A'}
        </span>
      </div>
      <div className="generic-mobile-card-row">
        <span className="generic-mobile-card-label">Borrow date:</span>
        <span className="generic-mobile-card-value">
          {data.borrow_date || 'N/A'}
        </span>
      </div>
      {data.estimated_return_date && (
        <div className="generic-mobile-card-row">
          <span className="generic-mobile-card-label">Estimated return:</span>
          <span className="generic-mobile-card-value">
            {data.estimated_return_date}
          </span>
        </div>
      )}
      {data.actual_return_date && (
        <div className="generic-mobile-card-row">
          <span className="generic-mobile-card-label">Returned:</span>
          <span className="generic-mobile-card-value">
            {data.actual_return_date}
          </span>
        </div>
      )}
    </>
  );
}

