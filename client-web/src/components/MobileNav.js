import React from 'react';
import { ScanQrCode, History, Package, Settings, Users } from 'lucide-react';
import './Admin.css';

/**
 * MobileNav component - Mobile bottom navigation bar with tabs and camera button
 * @param {Array} tabs - Array of tab identifiers to display
 * @param {string} activeTab - Currently active tab identifier
 * @param {Function} onTabClick
 * @param {Function} onCameraClick 
 * @param {Object} currentUser 
 */
const MobileNav = ({ tabs, activeTab, onTabClick, onCameraClick, currentUser }) => {
  const tabIconMap = {
    camera: ScanQrCode,
    users: Users,
    products: Package,
    history: History,
    settings: Settings
  };

  const renderTabIcon = (tab) => {
    const IconComponent = tabIconMap[tab];
    if (!IconComponent) {
      return null;
    }
    const isCamera = tab === 'camera';

    return (
      <IconComponent
        size={isCamera ? 28 : 22}
        strokeWidth={isCamera ? 2.6 : 2.2}
        aria-hidden="true"
      />
    );
  };

  return (
    <nav 
      className={`admin-mobile-nav ${currentUser?.role !== 'admin' ? 'admin-mobile-nav--no-camera' : ''}`} 
      aria-label="Navigation"
    >
      {currentUser?.role === 'admin' && (
        <button
          type="button"
          className="admin-mobile-nav__camera"
          onClick={onCameraClick}
          aria-label="Open camera scanner"
        >
          <ScanQrCode className="admin-mobile-nav__camera-icon" />
        </button>
      )}
      {tabs.map(tab => (
        <button
          type="button"
          onClick={() => onTabClick(tab)}
          className={[
            'admin-mobile-nav__cell',
            activeTab === tab ? 'is-active' : ''
          ].join(' ').trim()}
          aria-label={tab}
          key={tab}
        >
          {renderTabIcon(tab)}
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;

