import React, { useState, useEffect } from "react";
import ServerGrid from "./ServerGrid";
import StatusRenderer from "./StatusRenderer";
import QRCodeRenderer from "./QRCodeRenderer";
import { useNotification } from "./NotificationContext";
import { getApiBase } from "../config";
import "./Products.css";

export default function ProductsTab({
  currentUser,
  productsData,
  borrowingHistory,
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

  const generateQrHash = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let hash = '';
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

  // Fetch metadata on mount to populate dropdowns
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch device types and locations from API
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
          })),
        );
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(
          locationsData.map((loc) => ({
            id: loc.id,
            location_name: loc.location_name || loc.name,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  // Mobile version - same columns as before; just let grid scroll
  if (isMobile) {
    const isAdmin = currentUser?.role === "admin";
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
            allowEditing={isAdmin}
            allowDelete={isAdmin}
            pageSize={10}
            showAddButton={isAdmin}
            query={query}
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
                product_name: (payload.product_name || '').trim(),
                purchase_date: payload.purchase_date || null,
                location_id: loc ? loc.id : null,
                status: payload.status || 'available',
                details: payload.details || null,
                qr_code: generateQrHash(),
              };
            }}
          />
        </div>
      </div>
    );
  }

  // Desktop version
  const isAdmin = currentUser?.role === "admin";

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
        <input
          type="text"
          placeholder="Search ..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
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
            product_name: (payload.product_name || '').trim(),
            purchase_date: payload.purchase_date || null,
            location_id: loc ? loc.id : null,
            status: payload.status || 'available',
            details: payload.details || null,
            qr_code: generateQrHash(),
          };
        }}
      />
    </>
  );
}

function ProductForm({ data, setData }) {
  return (
    <div className="add-product-form">
      <div className="add-product-form-grid">
        <div>
          <label className="form-label">Product Name</label>
          <input
            type="text"
            className="form-input"
            value={data.product_name || ''}
            onChange={(e) =>
              setData({ ...data, product_name: e.target.value })
            }
          />
        </div>
        
        <div>
          <label className="form-label">Type Name</label>
          <input
            type="text"
            className="form-input"
            value={data.type_name || ''}
            onChange={(e) =>
              setData({ ...data, type_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="form-label">Purchase Date</label>
          <input
            type="number"
            className="form-input"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={data.purchase_date || ''}
            onChange={(e) =>
              setData({ ...data, purchase_date: e.target.value })
            }
          />
        </div>

        <div>
          <label className="form-label">Location Name</label>
          <input
            type="text"
            className="form-input"
            value={data.location_name || ''}
            onChange={(e) =>
              setData({ ...data, location_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={data.status || ''}
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
            value={data.details || ''}
            onChange={(e) =>
              setData({ ...data, details: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
