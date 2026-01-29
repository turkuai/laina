import React, { useState, useEffect } from 'react';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';
import { useNotification } from './NotificationContext';
import './Products.css';


export default function ProductsTab({ currentUser, productsData, borrowingHistory, query, onQueryChange }) {
  const { showNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [productsFromDb, setProductsFromDb] = useState([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch metadata on mount to populate dropdowns
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch device types and locations from API
  const fetchMetadata = async () => {
    setIsLoadingMeta(true);
    try {
      const [typesRes, locationsRes] = await Promise.all([
        fetch('/api/device-types', { credentials: 'include' }),
        fetch('/api/locations', { credentials: 'include' })
      ]);

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setDeviceTypes(typesData.map(t => ({
          id: t.id,
          type_name: t.type_name
        })));
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.map(loc => ({
          id: loc.id,
          location_name: loc.location_name || loc.name
        })));
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    } finally {
      setIsLoadingMeta(false);
    }
  };


  // Mobile version - same ServerGrid and add popup as desktop (all product fields)
  if (isMobile) {
    const isAdmin = currentUser?.role === 'admin';
    return (
      <div className="mobile-tab-content">
        <div className="mobile-content-section">
          <h2 className="title">Products</h2>
          <div className="user-search">
            <input
              placeholder="Search ..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>

          <ServerGrid
            key={refreshKey}
            columns={['product_name', 'type_name', 'purchase_date', 'location_name', 'status', 'details', 'qr_code']}
            columnRenderers={{ status: StatusRenderer, qr_code: QRCodeRenderer }}
            path="/products"
            allowEditing={isAdmin}
            allowDelete={isAdmin}
            pageSize={10}
            showAddButton={isAdmin}
            onDataChange={setProductsFromDb}
            query={query}
            typeOptions={deviceTypes}
            locationOptions={locations}
          />
        </div>
      </div>
    );
  }

  // Desktop version
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <>
      <h2 className="title">Products</h2>

      {/* Desktop search bar (reuses existing design) */}
      <div className="products-card__search">
        <span className="search-icon">
          {/* Simple magnifying glass icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke="#6b7280"
              strokeWidth="2"
            />
            <line
              x1="15"
              y1="15"
              x2="20"
              y2="20"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search ..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <ServerGrid
        key={refreshKey}
        columns={['product_name', 'type_name', 'purchase_date', 'location_name', 'status', 'details', 'qr_code']}
        columnRenderers={{ status: StatusRenderer, qr_code: QRCodeRenderer }}
        path="/products"
        allowEditing={isAdmin}
        allowDelete={isAdmin}
        pageSize={10}
        showAddButton={isAdmin}
        onDataChange={setProductsFromDb}
        query={query}
        typeOptions={deviceTypes}
        locationOptions={locations}
      />
    </>
  );
}
