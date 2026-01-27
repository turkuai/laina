import React, { useState } from 'react';
import { createPortal } from 'react-dom';

function UserInfoPopup({ username, password, onClose }) {
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    } catch (err) {
      console.error('Failed to copy username:', err);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleCopyAll = async () => {
    const allInfo = `Username: ${username}\nTemporary password: ${password}`;
    try {
      await navigator.clipboard.writeText(allInfo);
      setCopiedUsername(true);
      setCopiedPassword(true);
      setTimeout(() => {
        setCopiedUsername(false);
        setCopiedPassword(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const dialogContent = (
    <div className="user-info-popup-overlay" onClick={onClose}>
      <div className="user-info-popup" onClick={(e) => e.stopPropagation()}>
        <button className="user-info-popup-close" onClick={onClose}>×</button>
        
        <div className="user-info-popup-content">
          <h2 className="user-info-popup-title">User Created</h2>
          
          <div className="user-info-section">
            <div className="user-info-item">
              <label className="user-info-label">Username:</label>
              <div className="user-info-value-container">
                <span className="user-info-value">{username}</span>
                <button 
                  className="user-info-copy-btn"
                  onClick={handleCopyUsername}
                  title="Copy username"
                >
                  {copiedUsername ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="user-info-item">
              <label className="user-info-label">Temporary Password:</label>
              <div className="user-info-value-container">
                <span className="user-info-value">{password}</span>
                <button 
                  className="user-info-copy-btn"
                  onClick={handleCopyPassword}
                  title="Copy password"
                >
                  {copiedPassword ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="user-info-actions">
            <button className="user-info-copy-all-btn" onClick={handleCopyAll}>
              Copy All Information
            </button>
            <button className="user-info-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}

export default UserInfoPopup;
