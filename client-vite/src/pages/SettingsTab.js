import React, { useState } from 'react';
import './Admin.css';
import { getApiBase } from '../config';

/**
 * SettingsTab component - User settings including user details, password change, and logout
 * @param {Object} currentUser - Current authenticated user object
 * @param {Function} onLogout - Handler for logout button click
 */
const SettingsTab = ({
  currentUser,
  onLogout
}) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStatus, setPasswordStatus] = useState(null);

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Please fill in all fields before submitting.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/users/${currentUser?.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordForm.newPassword,
          current_password: passwordForm.currentPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to change password');
      }

      setPasswordStatus({ type: 'success', message: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordStatus({ type: 'error', message: error.message || 'Failed to change password. Please try again.' });
    }
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
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
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <label className="password-form-field">
              <span>Current password</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
            </label>
            <label className="password-form-field">
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </label>
            <label className="password-form-field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
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
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account settings and set e-mail preferences.</p>
      </div>
      
      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-profile">
              <h3>Profile</h3>
              <p className="settings-description">This is how others will see you on the site.</p>

              <div className="settings-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={currentUser?.name || 'Mohammad Admin'} 
                  readOnly
                  className="settings-input"
                />
              </div>

              <div className="settings-form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={currentUser?.username || 'admin'} 
                  readOnly
                  className="settings-input"
                />
              </div>

              <div className="settings-form-group">
                <label>Role</label>
                <input 
                  type="text" 
                  value={currentUser?.role || 'Administrator'} 
                  readOnly
                  className="settings-input"
                />
              </div>

              <div className="settings-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  className="settings-input"
                />
              </div>

              <div className="settings-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className="settings-input"
                />
              </div>

              <div className="settings-form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="settings-input"
                />
              </div>

              {passwordStatus && (
                <div
                  className={`password-status ${passwordStatus.type === 'error' ? 'error' : 'success'}`}
                  role="alert"
                >
                  {passwordStatus.message}
                </div>
              )}

              <div className="settings-actions">
                <button 
                  type="button" 
                  className="settings-update-btn"
                  onClick={handlePasswordSubmit}
                >
                  Update Profile
                </button>
                <button 
                  type="button" 
                  className="settings-logout-btn-new" 
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
