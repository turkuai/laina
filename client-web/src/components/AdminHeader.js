import React, { useState, useRef, useEffect } from 'react';
import { QrCode, ChevronDown, Settings, LogOut } from 'lucide-react';
import './Admin.css';

/**
 * AdminHeader component - Displays the header with title, user info, and action buttons
 * @param {Object} currentUser - Current authenticated user object
 * @param {Function} onLogout - Handler for logout button click
 * @param {Function} onBorrowClick - Handler for borrow/return button click
 * @param {Function} onSettingsClick - Handler for settings menu click
 * @param {boolean} isMobile - Whether the current view is mobile
 */
const AdminHeader = ({ currentUser, onLogout, onBorrowClick, onSettingsClick, isMobile = false }) => {
  const canAccessBorrow = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <div className="admin-header">
      <h1 className="admin-logo-text">
        Borrowing System{currentUser?.role === 'student' ? ' - My Dashboard' : ''}
      </h1>

      <div className="admin-header-actions">
        {canAccessBorrow && (
          <button
            onClick={onBorrowClick}
            className="borrow-button hide-on-mobile"
          >
            <QrCode size={18} />
            Borrow/Return
          </button>
        )}

        {!isMobile && (
          <div className="user-dropdown-container" ref={dropdownRef}>
            <button
              className="user-dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="user-info-text">
                Welcome, <strong>{currentUser?.username}</strong>
              </span>
              <ChevronDown size={16} className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown-menu">
                <button className="dropdown-menu-item" onClick={handleSettingsClick}>
                  <Settings size={16} />
                  Settings
                </button>
                <button className="dropdown-menu-item logout-item" onClick={handleLogoutClick}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
