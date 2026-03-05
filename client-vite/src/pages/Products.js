import React, { useState, useEffect, useRef } from "react";
import "./Products.css";
import ServerGrid from "../components/ServerGrid";
import QRCodeRenderer from "../components/QRCodeRenderer";
import { generateQRCodeWithInfo } from "../utils/qrCodeUtils";
import { useNotification } from "../components/NotificationContext";
import ConfirmDialog from "../components/ConfirmDialog";
import { getApiBase } from "../config";

// ProductModal component for displaying QR code
const ProductModal = ({ product, onClose }) => {
  const [qrLoading, setQrLoading] = useState(true);
  const overlayRef = useRef(null);

  if (!product) return null;

  const productData = JSON.stringify({
    id: product.id,
    name: product.product_name,
    deviceType: product.type_name,
    purchaseDate: product.purchase_date,
    location: product.location_name,
    status: product.status,
    details: product.details,
    qr_code: product.qr_code,
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productData)}`;

  const handleDownload = async () => {
    try {
      const blob = await generateQRCodeWithInfo(qrCodeUrl, product);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${product.product_name}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating QR code with info:", error);
      // Use window-level notification event to avoid hook usage inside nested component
      const event = new CustomEvent("app-notification", {
        detail: {
          message: "Failed to download QR code. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handlePrint = () => {
    if (overlayRef.current) overlayRef.current.classList.add("print-qr-card");
    window.print();
    const removePrintClass = () => {
      if (overlayRef.current) overlayRef.current.classList.remove("print-qr-card");
      window.removeEventListener("afterprint", removePrintClass);
    };
    window.addEventListener("afterprint", removePrintClass);
  };

  return (
    <div ref={overlayRef} className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="product-modal-close"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="product-modal-title">{product.product_name}</h2>

        <div className="product-modal-info">
          {product.type_name && (
            <div className="product-info-item">
              <strong>Device Type:</strong> {product.type_name}
            </div>
          )}
          {product.purchase_date && (
            <div className="product-info-item">
              <strong>Purchase Year:</strong> {product.purchase_date}
            </div>
          )}
          {product.location_name && (
            <div className="product-info-item">
              <strong>Location:</strong> {product.location_name}
            </div>
          )}
          {product.status && (
            <div className="product-info-item">
              <strong>Status:</strong> {product.status}
            </div>
          )}
        </div>

        <div className="product-modal-qr">
          <div className="qr-code-display">
            {qrLoading && (
              <div className="qr-code-spinner" aria-label="Generating QR code" />
            )}
            <img
              src={qrCodeUrl}
              alt="QR code for this product"
              className="qr-code-image"
              onLoad={() => setQrLoading(false)}
              onError={() => setQrLoading(false)}
            />
            <p className="qr-code-label">QR Code</p>
          </div>
        </div>

        <div className="product-modal-actions">
          <button onClick={handleDownload} className="product-modal-print-btn">
            Download QR Code
          </button>
          <button onClick={handlePrint} className="product-modal-print-btn">
            Print QR Code
          </button>
          <button onClick={onClose} className="product-modal-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Generate a unique 45-character hash
const generateHash = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 45; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

export default function Products({ currentUser }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    product_name: "",
    device_type_id: "",
    purchase_date: new Date().getFullYear(),
    location_id: "",
    status: "available",
    details: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    product_name: "",
    device_type_id: "",
    purchase_date: "",
    location_id: "",
    details: "",
  });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showNotification } = useNotification();

  // ✅ Mobile incremental rendering (prevents dumping 500+ cards at once)
  const MOBILE_BATCH = 20;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [visibleCount, setVisibleCount] = useState(MOBILE_BATCH);
  const mobileSentinelRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync edit form when opening edit modal
  useEffect(() => {
    if (editingProduct) {
      setEditFormData({
        product_name: editingProduct.product_name || "",
        device_type_id: editingProduct.device_type_id ?? "",
        purchase_date: editingProduct.purchase_date ?? "",
        location_id: editingProduct.location_id ?? "",
        details: editingProduct.details || "",
      });
    }
  }, [editingProduct]);

  // Fetch all data on component mount and when refresh event is triggered
  useEffect(() => {
    loadAllData();

    const handleRefresh = () => {
      loadAllData();
    };

    window.addEventListener("products-refresh", handleRefresh);
    return () => window.removeEventListener("products-refresh", handleRefresh);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch products, device types, and locations in parallel
      const base = getApiBase();
      const [productsRes, typesRes, locationsRes] = await Promise.all([
        fetch(`${base}/api/products?page=1`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${base}/api/device-types`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${base}/api/locations?page=1`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!productsRes.ok || !typesRes.ok || !locationsRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const productsData = await productsRes.json();
      const typesData = await typesRes.json();
      const locationsData = await locationsRes.json();

      // Handle different response formats
      const normalizeList = (data, keys) => {
        if (Array.isArray(data)) return data;
        for (const key of keys) {
          if (Array.isArray(data?.[key])) return data[key];
        }
        return [];
      };

      setProducts(normalizeList(productsData, ["products", "data", "items"]));
      setDeviceTypes(
        normalizeList(typesData, ["device_types", "types", "data", "items"]),
      );
      setLocations(
        normalizeList(locationsData, ["locations", "data", "items"]),
      );
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (
      !formData.product_name.trim() ||
      !formData.device_type_id ||
      !formData.purchase_date
    ) {
      showNotification(
        "Please fill in all required fields (Product Name, Device Type, Purchase Year)",
        "error",
      );
      return;
    }

    try {
      const newProduct = {
        device_type_id: parseInt(formData.device_type_id),
        product_name: formData.product_name,
        purchase_date: parseInt(formData.purchase_date),
        location_id: formData.location_id
          ? parseInt(formData.location_id)
          : null,
        status: formData.status,
        details: formData.details || null,
        qr_code: generateHash(), // Generate hash once and send to database
      };

      const response = await fetch(`${getApiBase()}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      // Reload products from database
      await loadAllData();

      setFormData({
        product_name: "",
        device_type_id: "",
        purchase_date: new Date().getFullYear(),
        location_id: "",
        status: "available",
        details: "",
      });
      setShowAddForm(false);
      showNotification(
        `Product "${formData.product_name}" added successfully and saved to database with unique hash!`,
        "success",
      );
    } catch (err) {
      console.error("Error adding product:", err);
      showNotification(`Failed to add product: ${err.message}`, "error");
    }
  };

  const handleDelete = async (productId) => {
    if (currentUser?.role !== "admin") return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setDeleteTarget(product);
  };

  const performDelete = async (product) => {
    if (!product?.id) return;
    try {
      const response = await fetch(`${getApiBase()}/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let msg = `Failed to delete product (status ${response.status})`;
        try {
          const data = await response.json();
          msg = data.error || data.message || msg;
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(msg);
      }

      // Reload products from database
      await loadAllData();
      showNotification(
        `Product "${product.product_name}" deleted from database.`,
        "success",
      );
    } catch (err) {
      console.error("Error deleting product:", err);
      showNotification(
        err.message ||
          "Failed to delete product. Please make sure the server is running.",
        "error",
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct?.id) return;
    if (
      !editFormData.product_name.trim() ||
      !editFormData.device_type_id ||
      !editFormData.purchase_date
    ) {
      showNotification(
        "Please fill in all required fields (Product Name, Device Type, Purchase Year)",
        "error",
      );
      return;
    }

    try {
      const payload = {
        product_name: editFormData.product_name,
        device_type_id: parseInt(editFormData.device_type_id),
        purchase_date: parseInt(editFormData.purchase_date),
        location_id: editFormData.location_id
          ? parseInt(editFormData.location_id)
          : null,
        details: editFormData.details || null,
      };

      const response = await fetch(`${getApiBase()}/api/products/${editingProduct.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      await loadAllData();
      setEditingProduct(null);
      showNotification(
        `Product "${editFormData.product_name}" updated.`,
        "success",
      );
    } catch (err) {
      console.error("Error updating product:", err);
      showNotification(err.message || "Failed to update product.", "error");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.type_name &&
        p.type_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Reset mobile visible count when the list changes (search or refresh)
  useEffect(() => {
    setVisibleCount(MOBILE_BATCH);
  }, [searchTerm, products.length]);

  // Increase visible items when scrolling near the bottom (mobile only)
  useEffect(() => {
    if (!isMobile) return;
    if (visibleCount >= filteredProducts.length) return;

    const el = mobileSentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          setVisibleCount((v) =>
            Math.min(v + MOBILE_BATCH, filteredProducts.length),
          );
        }
      },
      { rootMargin: "200px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [isMobile, visibleCount, filteredProducts.length]);

  // Custom status renderer for colored badges
  const renderStatus = (status) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status === "available" ? "Available" : "Borrowed"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="products-card">
        <div className="products-card__header">
          <h2 className="title">Products</h2>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading products from database.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-card">
        <div className="products-card__header">
          <h2 className="title">Products</h2>
        </div>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#dc2626",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            margin: "10px",
          }}
        >
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={loadAllData}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-card">
      <div className="products-card__header">
        <h2 className="title">Products ({products.length})</h2>
        {currentUser?.role === "admin" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? "✕ Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showAddForm && (
        <div
          className="product-modal-overlay"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="product-modal add-product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px" }}
          >
            <button
              onClick={() => setShowAddForm(false)}
              className="product-modal-close"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="product-modal-title">Add product</h2>
            <div className="add-product-form-grid">
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Device Type *</label>
                <select
                  value={formData.device_type_id}
                  onChange={(e) =>
                    setFormData({ ...formData, device_type_id: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">Select type.</option>
                  {deviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name || type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Purchase Year *</label>
                <input
                  type="number"
                  value={formData.purchase_date}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_date: e.target.value })
                  }
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <select
                  value={formData.location_id}
                  onChange={(e) =>
                    setFormData({ ...formData, location_id: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">Select location.</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <input
                  type="text"
                  value="Available"
                  readOnly
                  disabled
                  className="form-input"
                  style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label className="form-label">Details</label>
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  placeholder="Additional details"
                  className="form-input"
                />
              </div>
              <div className="product-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="product-modal-close-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="product-modal-print-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Confirm deletion"
          message={`Are you sure you want to remove the product "${deleteTarget.product_name}"?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await performDelete(deleteTarget);
            setDeleteTarget(null);
          }}
          isDestructive={true}
        />
      )}

      {editingProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="product-modal add-product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px" }}
          >
            <button
              onClick={() => setEditingProduct(null)}
              className="product-modal-close"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="product-modal-title">Edit product</h2>
            <div className="add-product-form-grid">
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={editFormData.product_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      product_name: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Device Type *</label>
                <select
                  value={editFormData.device_type_id}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      device_type_id: e.target.value,
                    })
                  }
                  className="form-select"
                >
                  <option value="">Select type.</option>
                  {deviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name || type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Purchase Year *</label>
                <input
                  type="number"
                  value={editFormData.purchase_date}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      purchase_date: e.target.value,
                    })
                  }
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <select
                  value={editFormData.location_id}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location_id: e.target.value,
                    })
                  }
                  className="form-select"
                >
                  <option value="">Select location.</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <input
                  type="text"
                  value={editingProduct.status || "Available"}
                  readOnly
                  disabled
                  className="form-input"
                  style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label className="form-label">Details</label>
                <input
                  type="text"
                  value={editFormData.details}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      details: e.target.value,
                    })
                  }
                  placeholder="Additional details"
                  className="form-input"
                />
              </div>
              <div className="product-modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="product-modal-close-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="product-modal-print-btn"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="products-card__search">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="search-icon"
        >
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search products."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      {!isMobile && (
        <div className="products-card__table">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Device Type</th>
                <th>Purchase Year</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-center">QR Code</th>
                {currentUser?.role === "admin" && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.product_name}</td>
                    <td>{p.type_name || "N/A"}</td>
                    <td>{p.purchase_date}</td>
                    <td>{p.location_name || "N/A"}</td>
                    <td>{renderStatus(p.status)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="view-qr-btn"
                      >
                        View QR
                      </button>
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="text-center">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="delete-btn"
                          aria-label="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={currentUser?.role === "admin" ? "7" : "6"}
                    className="empty-state"
                  >
                    {searchTerm
                      ? "No products found matching your search."
                      : "No products in database. Add your first product!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card Layout */}
      {isMobile && (
        <div className="products-mobile-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, visibleCount).map((p) => (
              <div key={p.id} className="products-mobile-card">
                <div className="products-mobile-card-header">
                  <div className="products-mobile-card-title">
                    {p.product_name}
                  </div>
                  <div className="products-mobile-card-status">
                    {renderStatus(p.status)}
                  </div>
                </div>
                <div className="products-mobile-card-row">
                  <span className="products-mobile-card-label">
                    Device Type:
                  </span>
                  <span className="products-mobile-card-value">
                    {p.type_name || "N/A"}
                  </span>
                </div>
                <div className="products-mobile-card-row">
                  <span className="products-mobile-card-label">
                    Purchase Year:
                  </span>
                  <span className="products-mobile-card-value">
                    {p.purchase_date}
                  </span>
                </div>
                <div className="products-mobile-card-row">
                  <span className="products-mobile-card-label">Location:</span>
                  <span className="products-mobile-card-value">
                    {p.location_name || "N/A"}
                  </span>
                </div>
                <div className="products-mobile-card-actions">
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="view-qr-btn"
                  >
                    View QR
                  </button>
                  {currentUser?.role === "admin" && (
                    <>
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="edit-btn"
                        aria-label="Edit"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="delete-btn"
                        aria-label="Delete"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              className="empty-state"
              style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}
            >
              {searchTerm
                ? "No products found matching your search."
                : "No products in database. Add your first product!"}
            </div>
          )}

          {visibleCount < filteredProducts.length && (
            <div ref={mobileSentinelRef} style={{ height: 1 }} />
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
