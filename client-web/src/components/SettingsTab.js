// src/components/SettingsTab.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Admin.css';

export default function SettingsTab() {
  const { currentUser } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordStatus({
        type: 'error',
        message: 'Please fill in all fields before submitting.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    // demo only
    setPasswordStatus({
      type: 'success',
      message: 'Password change request submitted. (Demo only)',
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="admin-settings">
      <h2 className="settings-title">Account settings</h2>

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
        <p className="account-text">
          You are logged in as <strong>{currentUser?.username}</strong>. Use the
          Logout button in the header to end your session.
        </p>
      </div>
    </div>
  );
}
