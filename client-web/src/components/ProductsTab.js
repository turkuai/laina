import React, { useState, useEffect } from 'react';
import Products from './Products';
import ServerGrid from './ServerGrid';
import StatusRenderer from './StatusRenderer';
import QRCodeRenderer from './QRCodeRenderer';
import { useNotification } from './NotificationContext';
import './Products.css';

// Simple hash generator for qr_code (shorter than the standalone Products view)
const generateHash = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 32; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

export default function ProductsTab({ currentUser, productsData, borrowingHistory, query, onQueryChange }) {
  const { showNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    device_type_id: '',
    purchase_date: new Date().getFullYear(),
    location_id: '',
    status: 'available',
    details: '',
  });
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

  // Build unique device types and locations from products already loaded from the database
  const ensureMetaLoaded = () => {
    if (deviceTypes.length && locations.length) return;

    // Try to fetch from API
    fetchMetadata();
  };

  const handleOpenAddModal = () => {
    ensureMetaLoaded();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      product_name: '',
      device_type_id: '',
      purchase_date: new Date().getFullYear(),
      location_id: '',
      status: 'available',
      details: '',
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!formData.product_name.trim() || !formData.device_type_id || !formData.purchase_date) {
      showNotification('Please fill in Product name, Type and Purchase year', 'error');
      return;
    }

    try {
      const payload = {
        device_type_id: parseInt(formData.device_type_id, 10),
        product_name: formData.product_name.trim(),
        purchase_date: parseInt(formData.purchase_date, 10),
        location_id: formData.location_id ? parseInt(formData.location_id, 10) : null,
        status: formData.status,
        details: formData.details || null,
        qr_code: generateHash(),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = 'Failed to add product';
        try {
          const data = await res.json();
          msg = data.error || data.message || msg;
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(msg);
      }

      // Force ServerGrid to refetch
      setRefreshKey((k) => k + 1);
      // Also keep local cache in sync for dropdown options
      setProductsFromDb((prev) => [...prev, payload]);
      handleCloseAddModal();
      showNotification('Product added successfully!', 'success');
    } catch (err) {
      console.error('Add product error:', err);
      showNotification(err.message || 'Failed to add product', 'error');
    }
  };

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
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <div className="products-card">
      <div className="products-card__header">
        <div className="title">Products</div>
      </div>

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
        columns={['product_name', 'type_name', 'purchase_date', 'location_name', 'status', 'qr_code']}
        columnRenderers={{ status: StatusRenderer, qr_code: QRCodeRenderer }}
        path="/products"
        allowEditing={isAdmin}
        allowDelete={isAdmin}
        pageSize={10}
        onAdd={isAdmin ? handleOpenAddModal : undefined}
        showAddButton={isAdmin}
        onDataChange={setProductsFromDb}
        query={query}
        typeOptions={deviceTypes}
        locationOptions={locations}
      />

      {showAddModal && (
        <div className="product-modal-overlay" onClick={handleCloseAddModal}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <button
              onClick={handleCloseAddModal}
              className="product-modal-close"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="product-modal-title">Add Product</h2>

            <form onSubmit={handleSubmitProduct} className="add-product-form">
              <div className="add-product-form-grid">
                <div>
                  <label className="form-label">Product name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, product_name: e.target.value }))
                    }
                    placeholder="Camera kit"
                  />
                </div>

                <div>
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={formData.device_type_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, device_type_id: e.target.value }))
                    }
                    disabled={isLoadingMeta}
                  >
                    <option value="">Select type...</option>
                    {deviceTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type_name || t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Purchase year *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.purchase_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))
                    }
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    value={formData.location_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location_id: e.target.value }))
                    }
                    disabled={isLoadingMeta}
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.location_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Details</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.details}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, details: e.target.value }))
                    }
                    placeholder="Extra info (optional)"
                  />
                </div>

                <button
                  type="submit"
                  className="form-add-btn"
                  disabled={isLoadingMeta}
                >
                  Save product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
