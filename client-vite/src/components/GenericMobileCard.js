import React from 'react';

/**
 * Generic wrapper for rendering items in DataSetView for mobile grids.
 * Handles styling the outer card envelope and appending standard edit/delete action buttons.
 */
export default function GenericMobileCard({ children, customActions, onEdit, onDelete }) {
  // Determine if we need an actions bar at all
  const hasActions = !!customActions || !!onEdit || !!onDelete;

  return (
    <div className="mobile-card">
      {/* Content injected here (e.g. User details, Product details) */}
      {children}
      
      {/* Common Actions Footer */}
      {hasActions && (
        <div className="mobile-card-actions">
          {customActions}
          
          {onEdit && (
            <button
              onClick={onEdit}
              className="edit-btn"
              aria-label="Edit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="delete-btn"
              aria-label="Delete"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
