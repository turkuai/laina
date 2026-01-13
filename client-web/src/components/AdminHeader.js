import React from 'react';
import { QrCode } from 'lucide-react';
import './Admin.css';

/**
 * AdminHeader component - Displays the header with title, user info, and action buttons
 * @param {Object} currentUser - Current authenticated user object
 * @param {Function} onLogout - Handler for logout button click
 * @param {Function} onBorrowClick - Handler for borrow/return button click
 */
const AdminHeader = ({ currentUser, onLogout, onBorrowClick }) => {
  const canAccessBorrow = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  return (
    <div className="admin-header">
      <h1 className="admin-logo-text">
        Borrowing System {currentUser?.role === 'student' ? '- My Dashboard' : <span className="hide-on-mobile"> - Admin Panel</span>}
      </h1>

      <div className="admin-header-actions">
        <span className="user-info mobile-header-user">
          Welcome, <strong>{currentUser?.username}</strong>
          <span className="admin-badge">({currentUser?.role})</span>
          <button
            onClick={onLogout}
            className="logout-button"
          >
            Logout
          </button>
        </span>

        {canAccessBorrow && (
          <button
            onClick={onBorrowClick}
            className="borrow-button hide-on-mobile"
          >
            <QrCode size={18} />
            Borrow/Return
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
