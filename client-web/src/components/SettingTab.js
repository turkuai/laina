import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './Admin.css';

export function SettingsTab() {
  const {
    currentUser,
    passwordForm,
    handlePasswordInputChange,
    handlePasswordSubmit,
    passwordStatus,
  } = useOutletContext();

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
          <span className="settings-value">
            {currentUser?.username || '-'}
          </span>
        </div>
        <div className="settings-field">
          <span className="settings-label">Role</span>
          <span className="settings-value">{currentUser?.role || '-'}</span>
        </div>
      </div>
      <div className="admin-settings-section">
        <h3>Change Password</h3>
        <form className="password-form" onSubmit={handlePasswordSubmit}>
          <label className="password-form-field">
            <span>Current password</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordInputChange('currentPassword', e.target.value)
              }
              placeholder="Enter current password"
            />
          </label>
          <label className="password-form-field">
            <span>New password</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordInputChange('newPassword', e.target.value)
              }
              placeholder="Enter new password"
            />
          </label>
          <label className="password-form-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordInputChange('confirmPassword', e.target.value)
              }
              placeholder="Re-enter new password"
            />
          </label>
          {passwordStatus && (
            <div
              className={`password-status ${
                passwordStatus.type === 'error' ? 'error' : 'success'
              }`}
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
        {/* Extra account actions if you like */}
      </div>
    </div>
  );
}