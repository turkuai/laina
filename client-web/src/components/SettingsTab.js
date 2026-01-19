import React from 'react';
import './Admin.css';

/**
 * SettingsTab component - User settings including user details, password change, and logout
 * @param {Object} currentUser - Current authenticated user object
 * @param {Object} passwordForm - Password form state with currentPassword, newPassword, confirmPassword
 * @param {Object} passwordStatus - Password form status with type and message
 * @param {Function} onPasswordInputChange - Handler for password input changes
 * @param {Function} onPasswordSubmit - Handler for password form submission
 * @param {Function} onLogout - Handler for logout button click
 */
const SettingsTab = ({
  currentUser,
  passwordForm,
  
  passwordStatus,
  onPasswordInputChange,
  onPasswordSubmit,
  onLogout
}) => {
  return (
    <div className="admin-settings">
      <div className="admin-settings-section">
        <h3>User Details</h3>
        <div className="settings-field">
          <span className="settings-label">Name</span>
          <span className="settings-value">{currentUser?.name || '-'}</span>
        </div>
        <div className="settings-field">
          <span className="settings-label">Username</span>
          <span className="settings-value">{currentUser?.username || '-'}</span>
        </div>
        <div className="settings-field">
          <span className="settings-label">Role</span>
          <span className="settings-value">{currentUser?.role || '-'}</span>
        </div>
      </div>

      <div className="admin-settings-section">
        <h3>Change Password</h3>
        <form className="password-form" onSubmit={onPasswordSubmit}>
          <label className="password-form-field">
            <span>Current password</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => onPasswordInputChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </label>
          <label className="password-form-field">
            <span>New password</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onPasswordInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
            />
          </label>
          <label className="password-form-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onPasswordInputChange('confirmPassword', e.target.value)}
              placeholder="Re-enter new password"
            />
          </label>

          {passwordStatus && (
            <div
              className={`password-status ${passwordStatus.type === 'error' ? 'error' : 'success'}`}
              role="alert"
            >
              {passwordStatus.message}
            </div>
          )}

          <button type="submit" className="password-submit-btn">
            Update Password
          </button>
        </form>
      </div>

      <div className="admin-settings-section">
        <h3>Account</h3>
        <button type="button" className="settings-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
