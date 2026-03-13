import React from 'react';
import ServerGrid from '../components/ServerGrid';
import MobileSearchToggle from '../components/MobileSearchToggle';
import DataSetView from '../components/DataSetView';
import { getApiBase } from '../config';
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

  const loadHistoryPage = async (page) => {
    // Backend currently returns the full history regardless of page.
    // To avoid duplicate rows, only load page 1 until real pagination is implemented.
    if (page > 1) {
      return [];
    }

    let fullPath = path;
    if (!fullPath.startsWith('/api/')) {
      const cleanPath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath;
      fullPath = `/api/${cleanPath}`;
    }

    const base = getApiBase();
    const separator = fullPath.includes('?') ? '&' : '?';
    let url = `${base}${fullPath}${separator}page=${page}`;

    const trimmedQuery = (query || '').trim();
    if (trimmedQuery !== '') {
      url += `&search=${encodeURIComponent(trimmedQuery)}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(
        payload?.error || payload?.message || `Failed to load history (status ${res.status})`,
      );
    }

    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload.history)) {
      return payload.history;
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
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
              render={HistoryRow}
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
    <div className="products-mobile-card" style={{ marginBottom: '0.75rem' }}>
      <div className="products-mobile-card-header">
        <div className="products-mobile-card-title">
          {data.product_name || 'Unknown product'}
        </div>
        <div className="products-mobile-card-status">
          <span className={`status-badge status-${data.status || 'unknown'}`}>
            {data.status || 'unknown'}
          </span>
        </div>
      </div>
      <div className="products-mobile-card-row">
        <span className="products-mobile-card-label">Borrower:</span>
        <span className="products-mobile-card-value">
          {data.borrower_name || 'N/A'}
        </span>
      </div>
      <div className="products-mobile-card-row">
        <span className="products-mobile-card-label">Borrow date:</span>
        <span className="products-mobile-card-value">
          {data.borrow_date || 'N/A'}
        </span>
      </div>
      {data.estimated_return_date && (
        <div className="products-mobile-card-row">
          <span className="products-mobile-card-label">Estimated return:</span>
          <span className="products-mobile-card-value">
            {data.estimated_return_date}
          </span>
        </div>
      )}
      {data.actual_return_date && (
        <div className="products-mobile-card-row">
          <span className="products-mobile-card-label">Returned:</span>
          <span className="products-mobile-card-value">
            {data.actual_return_date}
          </span>
        </div>
      )}
    </div>
  );
}

