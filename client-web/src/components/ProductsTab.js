import React, { useState, useEffect } from 'react';
import Products from './Products';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';

export default function ProductsTab({ currentUser, productsData, borrowingHistory, query, onQueryChange }) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile version
  if (isMobile) {
    return (
      <div className="mobile-tab-content">
        <div className="mobile-content-section">
          {/* Search Box */}
          <div className="user-search">
            <input
              placeholder="Search ..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>

          <Products
            currentUser={currentUser}
            borrowingHistory={borrowingHistory}
            productsData={productsData}
            query={query}
          />
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div>
      <ServerGrid
        columns={['product_name', 'type_name', 'purchase_date', 'location_name', 'status', 'qr_code']}
        columnRenderers={{ status: StatusRenderer, qr_code: QRCodeRenderer }}
        path="/products"
        allowEditing={false}
        allowDelete={true}
        pageSize={10}
      />
    </div>
  );
}
