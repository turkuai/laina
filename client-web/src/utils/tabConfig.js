import React from 'react';
import { ScanQrCode, History, Package, Settings, Users } from 'lucide-react';

// Tab icon map - maps tab names to their corresponding icon components
const TAB_ICON_MAP = {
  camera: ScanQrCode,
  users: Users,
  products: Package,
  history: History,
  settings: Settings,
};

// Tab label map - base labels for tabs
const TAB_LABEL_MAP = {
  camera: 'Camera',
  users: 'Users',
  products: 'Products',
  history: 'Borrowing History',
  settings: 'Settings',
};

/**
 * Tab configuration utility module
 * Provides reusable functions for tab management, labels, and icons
 */
export const TabConfig = {
  /**
   * Get available tabs based on user role and mobile state
   * @param {Object} currentUser - Current authenticated user object
   * @param {boolean} isMobile - Whether the view is mobile
   * @returns {Array<string>} - Array of tab identifiers
   */
  getTabs(currentUser, isMobile) {
    const tabs = ['history', 'products'];

    // Admin & teacher can access users tab
    if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
      tabs.push('users');
    }

    // Settings tab available on both mobile and desktop
    tabs.push('settings');

    return tabs;
  },

  /**
   * Get label for a tab
   * @param {string} tab - Tab identifier
   * @param {boolean} forMobile - Whether the label is for mobile view
   * @returns {string} - Tab label
   */
  getTabLabel(tab, forMobile = false) {
    if (tab === 'history' && forMobile) {
      return 'History';
    }
    return TAB_LABEL_MAP[tab] || tab;
  },

  /**
   * Render icon component for a tab
   * @param {string} tab - Tab identifier
   * @returns {React.ReactElement|null} - Icon component or null
   */
  renderTabIcon(tab) {
    const IconComponent = TAB_ICON_MAP[tab];
    if (!IconComponent) return null;
    return React.createElement(IconComponent, { size: 18 });
  },

  /**
   * Get icon component for a tab (without rendering)
   * @param {string} tab - Tab identifier
   * @returns {React.ComponentType|null} - Icon component class or null
   */
  getTabIcon(tab) {
    return TAB_ICON_MAP[tab] || null;
  },
};
