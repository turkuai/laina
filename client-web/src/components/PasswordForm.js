import React from 'react';
import './Admin.css';

export default function PasswordForm({ form, status, onInputChange, onSubmit }) {
  return (
    <div className="admin-settings-section">
      <h3>Change Password</h3>
      <form className="password-form" onSubmit={onSubmit}>
        <label className="password-form-field">
          <span>Current password</span>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => onInputChange('currentPassword', e.target.value)}
            placeholder="Enter current password"
          />
        </label>
        <label className="password-form-field">
          <span>New password</span>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => onInputChange('newPassword', e.target.value)}
            placeholder="Enter new password"
          />
        </label>
        <label className="password-form-field">
          <span>Confirm new password</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            placeholder="Re-enter new password"
          />
        </label>

        {status && (
          <div
            className={`password-status ${status.type === 'error' ? 'error' : 'success'}`}
            role="alert"
          >
            {status.message}
          </div>
        )}

        <button type="submit" className="password-submit-btn">
          Update Password
        </button>
      </form>
    </div>
  );
}
