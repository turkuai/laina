import React, { useState, useEffect } from "react";
import ServerGrid from "../components/ServerGrid";
import StatusRenderer from "../components/StatusRenderer";
import QRCodeRenderer from "../components/QRCodeRenderer";
import { useNotification } from "../components/NotificationContext";
import { getApiBase } from "../config";
import "./Products.css";

export default function ProductsTab({
  currentUser,
  productsData,
  query,
  onQueryChange,
}) {
  const { showNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [productsFromDb, setProductsFromDb] = useState([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState(null);

  const generateQrHash = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let hash = "";
    for (let i = 0; i < 32; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setIsLoadingMeta(true);
    try {
      const base = getApiBase();
      const [typesRes, locationsRes] = await Promise.all([
        fetch(`${base}/api/device-types`, { credentials: "include" }),
        fetch(`${base}/api/locations`, { credentials: "include" }),
      ]);

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setDeviceTypes(
          typesData.map((t) => ({
            id: t.id,
            type_name: t.type_name,
          }))
        );
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(
          locationsData.map((loc) => ({
            id: loc.id,
            location_name: loc.location_name || loc.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  if (isMobile) {
    const canManageMeta =
      currentUser?.role === "admin" || currentUser?.role === "teacher";

    return (
      <div className="mobile-tab-content">
        <div className="mobile-content-section">
          <div className="mobile-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="title" style={{ margin: 0 }}>Products</h2>
            {canManageMeta && (
              <div className="secondary-tabs-mobile">
                <button
                  className={`tab-btn-mobile ${activeSubTab === "products" ? "active" : ""}`}
                  onClick={() => setActiveSubTab("products")}
                  aria-label="Products"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </button>
                <button
                  className={`tab-btn-mobile ${activeSubTab === "locations" ? "active" : ""}`}
                  onClick={() => setActiveSubTab("locations")}
                  aria-label="Manage Locations"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </button>
                <button
                  className={`tab-btn-mobile ${activeSubTab === "device-types" ? "active" : ""}`}
                  onClick={() => setActiveSubTab("device-types")}
                  aria-label="Manage Device Types"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {activeSubTab === "products" && (
            <>
              <div className="user-search" style={{ marginTop: '16px' }}>
                <input
                  placeholder="Search ..."
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleStatusFilter('available')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: statusFilter === 'available' ? '#059669' : 'white',
                      color: statusFilter === 'available' ? 'white' : '#374151',
                    }}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleStatusFilter('borrowed')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: statusFilter === 'borrowed' ? '#dc2626' : 'white',
                      color: statusFilter === 'borrowed' ? 'white' : '#374151',
                    }}
                  >
                    Borrowed
                  </button>
                </div>
              </div>

              <ServerGrid
                key={refreshKey}
                columns={[
                  "product_name",
                  "type_name",
                  "purchase_date",
                  "location_name",
                  "status",
                  "details",
                  "qr_code",
                ]}
                columnRenderers={{
                  status: StatusRenderer,
                  qr_code: QRCodeRenderer,
                }}
                path="/products"
                allowEditing={currentUser?.role === "admin"}
                allowDelete={currentUser?.role === "admin"}
                pageSize={10}
                showAddButton={currentUser?.role === "admin"}
                query={query}
                statusFilter={statusFilter || ''}
                typeOptions={deviceTypes}
                locationOptions={locations}
                formComponent={ProductForm}
                transformAddPayload={(payload) => {
                  const type = deviceTypes.find(
                    (t) => t.type_name === payload.type_name
                  );
                  const loc = locations.find(
                    (l) => l.location_name === payload.location_name
                  );
                  return {
                    device_type_id: type ? type.id : null,
                    product_name: (payload.product_name || "").trim(),
                    purchase_date: payload.purchase_date || null,
                    location_id: loc ? loc.id : null,
                    status: payload.status || "available",
                    details: payload.details || null,
                    qr_code: generateQrHash(),
                  };
                }}
              />
            </>
          )}

          {canManageMeta && activeSubTab === "locations" && (
            <div className="products-meta-section">
              <ServerGrid
                columns={["location_name", "description"]}
                path="locations"
                allowEditing={true}
                allowDelete={true}
                pageSize={10}
                showAddButton={true}
                formComponent={LocationForm}
              />
            </div>
          )}

          {canManageMeta && activeSubTab === "device-types" && (
            <div className="products-meta-section">
              <ServerGrid
                columns={["type_name"]}
                path="device-types"
                allowEditing={true}
                allowDelete={true}
                pageSize={10}
                showAddButton={true}
                formComponent={DeviceTypeForm}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";
  const canManageMeta =
    currentUser?.role === "admin" || currentUser?.role === "teacher";

  return (
    <>
      <h2 className="title">Products</h2>

      {canManageMeta && (
        <div className="secondary-tabs-desktop">
          <button
            className={`tab-btn-desktop ${activeSubTab === "products" ? "active" : ""}`}
            onClick={() => setActiveSubTab("products")}
          >
            Products
          </button>
          <button
            className={`tab-btn-desktop ${activeSubTab === "locations" ? "active" : ""}`}
            onClick={() => setActiveSubTab("locations")}
          >
            Manage locations
          </button>
          <button
            className={`tab-btn-desktop ${activeSubTab === "device-types" ? "active" : ""}`}
            onClick={() => setActiveSubTab("device-types")}
          >
            Manage device types
          </button>
        </div>
      )}

      {activeSubTab === "products" && (
        <>
          <div className="products-card__search" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="search-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="2" />
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
            <input type="text" style={{display:'none'}} autoComplete="username" />
            <input type="password" style={{display:'none'}} autoComplete="current-password" />
            <input
              type="search"
              name="products-search"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              placeholder="Search ..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
            <button
              onClick={() => handleStatusFilter('available')}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: statusFilter === 'available' ? '#059669' : 'white',
                color: statusFilter === 'available' ? 'white' : '#374151',
              }}
            >
              Available
            </button>
            <button
              onClick={() => handleStatusFilter('borrowed')}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: statusFilter === 'borrowed' ? '#dc2626' : 'white',
                color: statusFilter === 'borrowed' ? 'white' : '#374151',
              }}
            >
              Borrowed
            </button>
          </div>

          <ServerGrid
            key={refreshKey}
            columns={[
              "product_name",
              "type_name",
              "purchase_date",
              "location_name",
              "status",
              "details",
              "qr_code",
            ]}
            columnRenderers={{ status: StatusRenderer, qr_code: QRCodeRenderer }}
            path="/products"
            allowEditing={isAdmin}
            allowDelete={isAdmin}
            pageSize={10}
            showAddButton={isAdmin}
            query={query}
            statusFilter={statusFilter || ''}
            typeOptions={deviceTypes}
            locationOptions={locations}
            formComponent={ProductForm}
            transformAddPayload={(payload) => {
              const type = deviceTypes.find(
                (t) => t.type_name === payload.type_name
              );
              const loc = locations.find(
                (l) => l.location_name === payload.location_name
              );
              return {
                device_type_id: type ? type.id : null,
                product_name: (payload.product_name || "").trim(),
                purchase_date: payload.purchase_date || null,
                location_id: loc ? loc.id : null,
                status: payload.status || "available",
                details: payload.details || null,
                qr_code: generateQrHash(),
              };
            }}
          />
        </>
      )}

      {canManageMeta && activeSubTab === "locations" && (
        <div className="products-meta-section">
          <ServerGrid
            columns={["location_name", "description"]}
            path="locations"
            allowEditing={true}
            allowDelete={true}
            pageSize={10}
            showAddButton={true}
            formComponent={LocationForm}
          />
        </div>
      )}

      {canManageMeta && activeSubTab === "device-types" && (
        <div className="products-meta-section">
          <ServerGrid
            columns={["type_name"]}
            path="device-types"
            allowEditing={true}
            allowDelete={true}
            pageSize={10}
            showAddButton={true}
            formComponent={DeviceTypeForm}
          />
        </div>
      )}
    </>
  );
}

function ProductForm({ data, setData }) {
  const [deviceTypes, setDeviceTypes] = React.useState([]);
  const [locations, setLocations] = React.useState([]);

  React.useEffect(() => {
    const base = getApiBase();
    fetch(`${base}/api/device-types`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setDeviceTypes(Array.isArray(d) ? d : (d.device_types || d.data || [])))
      .catch(() => setDeviceTypes([]));
    fetch(`${base}/api/locations?page=1`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setLocations(Array.isArray(d) ? d : (d.locations || d.data || [])))
      .catch(() => setLocations([]));
  }, []);

  return (
    <div className="add-product-form">
      <div className="add-product-form-grid">
        <div>
          <label className="form-label">Product Name</label>
          <input
            type="text"
            className="form-input"
            value={data.product_name || ""}
            onChange={(e) =>
              setData({ ...data, product_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="form-label">Type Name</label>
          <select
            className="form-input"
            value={data.type_name || ""}
            onChange={(e) =>
              setData({ ...data, type_name: e.target.value })
            }
          >
            <option value="">Select type</option>
            {deviceTypes.map((t) => (
              <option key={t.id} value={t.type_name}>{t.type_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Purchase Date</label>
          <input
            type="number"
            className="form-input"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={data.purchase_date || ""}
            onChange={(e) =>
              setData({ ...data, purchase_date: e.target.value })
            }
          />
        </div>

        <div>
          <label className="form-label">Location Name</label>
          <select
            className="form-input"
            value={data.location_name || ""}
            onChange={(e) =>
              setData({ ...data, location_name: e.target.value })
            }
          >
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.location_name}>{l.location_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={data.status || ""}
            onChange={(e) =>
              setData({ ...data, status: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="form-label">Details</label>
          <textarea
            className="form-input"
            rows={3}
            value={data.details || ""}
            onChange={(e) =>
              setData({ ...data, details: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

function LocationForm({ data, setData }) {
  return (
    <div className="add-product-form">
      <div className="add-product-form-grid">
        <div>
          <label className="form-label">Location name</label>
          <input
            type="text"
            className="form-input"
            value={data.location_name || data.name || ""}
            onChange={(e) =>
              setData({ ...data, location_name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows={3}
            value={data.description || ""}
            onChange={(e) =>
              setData({ ...data, description: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

function DeviceTypeForm({ data, setData }) {
  return (
    <div className="add-product-form">
      <div className="add-product-form-grid">
        <div>
          <label className="form-label">Device type name</label>
          <input
            type="text"
            className="form-input"
            value={data.type_name || data.name || ""}
            onChange={(e) =>
              setData({ ...data, type_name: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
//470-Borrowing-history-fetch-should-include-deviceName-borrowerName-and-lenderName