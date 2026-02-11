import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Grid from './Grid';
import Products from './Products';
import './Admin.css';
import QRScannerCamera from './QRScannerCamera';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';
import { formatDate, getCurrentDate } from '../utils/dateUtils';
import MobileProductBox from './MobileProductBox';
import MobileProductModal from './MobileProductModal';

import CameraView from './CameraView';
import SearchBox from './SearchBox';
import SettingsTab from './SettingsTab';
import Header from './Header';
import ProductModals from './ProductModals';
import HomeTabs from './HomeTabs';
import MobileNav from './MobileNav';
import { useHistoryFilter } from '../hooks/useHistoryFilter';
import { useQRScanner } from '../hooks/useQRScanner';
import { usePasswordForm } from '../hooks/usePasswordForm';
import { useUserManagement } from '../hooks/useUserManagement';
import { useResponsive } from '../hooks/useResponsive';
import ProductsTab from './ProductsTab';
import UsersTab from './UsersTab';
import HistoryTab from './HistoryTab';
import { TabConfig } from '../utils/tabConfig';

export default function HomePage({ productsData }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');

  // State to force refresh of products
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);

  // Callback to refresh products after borrow/return
  const refreshProducts = () => {
    setProductsRefreshKey(prev => prev + 1);
    // Also trigger window event for Products component to refresh
    window.dispatchEvent(new Event('products-refresh'));
  };

  // QR Scanner hook
  const {
    showCamera,
    setShowCamera,
    scannedProduct,
    productStatus,
    handleQRScan,
    handleReturn,
    handleBorrow,
    handleClose
  } = useQRScanner(refreshProducts, currentUser);

  // Password form hook
  const {
    passwordForm,
    passwordStatus,
    handlers: { handlePasswordInputChange, handlePasswordSubmit, clearPasswordStatus }
  } = usePasswordForm();

  // User management hook
  const {
    handlers: { handleDeleteUser }
  } = useUserManagement();

  // Responsive hook
  const { isMobile, setIsMobile } = useResponsive();

  // Set default tab based on role
  const [activeTab, setActiveTab] = useState(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (currentUser?.role === "student") {
      return "history"; // opiskelijan aloitusnäkymä
    }

    if (isMobile) {
      return "history"; // Default to history on mobile (camera is now a modal)
    }

    return currentUser?.role === "admin" ? "users" : "history";
  });

  const [borrowingHistory, setBorrowingHistory] = useState([
    { id: 1, userName: 'Mikko', productName: 'Laptop Dell XPS', borrowedAt: '2024-01-15', returnedAt: '2024-01-20', status: 'Returned', userId: 2 },
    { id: 2, userName: 'Ville', productName: 'Monitor Samsung', borrowedAt: '2024-01-18', returnedAt: null, status: 'On Loan', userId: 3 },
    { id: 3, userName: 'Aino', productName: 'Keyboard Mechanical', borrowedAt: '2024-01-10', returnedAt: '2024-01-17', status: 'Returned', userId: 5 },
    { id: 4, userName: 'Mikko', productName: 'Headphones Sony', borrowedAt: '2024-01-22', returnedAt: null, status: 'On Loan', userId: 2 },
  ]);

  // Custom hooks for data filtering
  const { filteredHistory } = useHistoryFilter(borrowingHistory, currentUser, userQuery);

  // Track previous isMobile value (no tab reset on resize)
  const prevIsMobileRef = useRef(isMobile);

  useEffect(() => {
    prevIsMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    if (activeTab !== 'settings' && passwordStatus) {
      clearPasswordStatus();
    }
  }, [activeTab, passwordStatus, clearPasswordStatus]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDataChange = (updatedData) => {
    if (activeTab === 'history') setBorrowingHistory(updatedData);
  };

  // Tab configuration - using utility module
  const tabs = TabConfig.getTabs(currentUser, isMobile);

  return (
    <div className="admin-page">

      {/* Header - Hidden when scanning */}
      {!showCamera && (
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onBorrowClick={() => setShowCamera(true)}
          onSettingsClick={() => setActiveTab('settings')}
          isMobile={isMobile}
        />
      )}

      {/* Mobile Content - Render based on active tab */}
      {isMobile && (
        <>
          {/* Mobile Users tab */}
          {currentUser?.role === 'admin' && (
            <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
              <UsersTab
                currentUser={currentUser}
                query={userQuery}
                onQueryChange={setUserQuery}
                onDeleteUser={handleDeleteUser}
                onDataChange={handleDataChange}
              />
            </div>
          )}

          {/* Mobile Products tab */}
          <div
            style={{ display: activeTab === 'products' ? 'block' : 'none' }}
            className="mobile-tab-content"
          >
            <div className="mobile-content-section">
              <Products
                key={productsRefreshKey}
                currentUser={currentUser}
                borrowingHistory={borrowingHistory}
                productsData={productsData}
                query={userQuery}
              />
            </div>
          </div>

          {/* Mobile History tab */}
          <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
            <HistoryTab
              currentUser={currentUser}
              query={userQuery}
              onQueryChange={setUserQuery}
            />
          </div>

          {/* Mobile Settings tab */}
          <div
            style={{ display: activeTab === 'settings' ? 'block' : 'none' }}
            className="mobile-tab-content"
          >
            <div className="mobile-content-section">
              <SettingsTab currentUser={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </>
      )}

      {showCamera && currentUser?.role !== 'student' && (
        <QRScannerCamera
          onScan={handleQRScan}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Product Modals - Desktop Only */}
      {!isMobile && (
        <ProductModals
          scannedProduct={scannedProduct}
          productStatus={productStatus}
          onClose={handleClose}
          onReturn={handleReturn}
          onBorrow={handleBorrow}
          getCurrentDate={getCurrentDate}
        />
      )}

      {/* Mobile Product Modal - Mobile Only */}
      {isMobile && (
        <MobileProductModal
          scannedProduct={scannedProduct}
          productStatus={productStatus}
          onClose={handleClose}
          onReturn={handleReturn}
          onBorrow={handleBorrow}
          getCurrentDate={getCurrentDate}
        />
      )}

      {/* Tabs - Desktop */}
      {!isMobile && (
        <HomeTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          getTabLabel={TabConfig.getTabLabel}
          renderTabIcon={TabConfig.renderTabIcon}
        />
      )}

      {/* Desktop Content Area */}
      <div className="admin-content hide-on-mobile">
        <div className="admin-content-card">
          {/* Desktop Users tab */}
          {currentUser?.role === 'admin' && (
            <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
              <UsersTab
                currentUser={currentUser}
                query={userQuery}
                onQueryChange={setUserQuery}
                onDeleteUser={handleDeleteUser}
                onDataChange={handleDataChange}
              />
            </div>
          )}

          {/* Desktop Products tab */}
          <div style={{ display: activeTab === 'products' ? 'block' : 'none' }}>
            <ProductsTab
              key={productsRefreshKey}
              currentUser={currentUser}
              productsData={productsData}
              borrowingHistory={borrowingHistory}
              query={userQuery}
              onQueryChange={setUserQuery}
            />
          </div>

          {/* Desktop History tab */}
          <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
            <HistoryTab
              currentUser={currentUser}
              query={userQuery}
              onQueryChange={setUserQuery}
            />
          </div>

          {/* Desktop Settings tab */}
          <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
            <SettingsTab currentUser={currentUser} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (hidden while QR scanner is open) */}
      {isMobile && !showCamera && (
        <MobileNav
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          onCameraClick={() => {
            // Open camera as modal without changing active tab
            setShowCamera(true);
          }}
          currentUser={currentUser}
        />
      )}

    </div >
  );
}

