import React, { useState, useEffect } from 'react';
import './Products.css';
import ServerGrid from './ServerGrid';
import QRCodeRenderer from './QRCodeRenderer';

// Generate a unique 45-character hash
const generateHash = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 45; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

// QR Code Component
const QRCodeDisplay = ({ data }) => {
  return (
    <div className="qr-code-container">
      <div className="qr-code-image" style={{
        background: `url("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}")`,
        backgroundSize: '250px 250px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}></div>
      <p className="qr-code-label">
        Scan to view product
      </p>
    </div>
  );
};

// Product Modal with QR Code
const ProductModal = ({ product, onClose }) => {
  const productData = JSON.stringify({
    id: product.id,
    name: product.product_name,
    deviceType: product.type_name,
    purchaseDate: product.purchase_date,
    location: product.location_name,
    status: product.status,
    details: product.details,
    qr_code: product.qr_code,
    ...(product.status === 'borrowed' && product.current_borrower_name && {
      borrower: product.current_borrower_name,
      borrowDate: product.current_borrow_date,
      estimatedReturn: product.estimated_return_date
    })
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productData)}`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${product.product_name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px;
              margin: 0;
            }
            .print-container {
              text-align: center;
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .product-details {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 24px;
            }
            .qr-code {
              border: 2px solid #e5e7eb;
              padding: 20px;
              border-radius: 12px;
              background: white;
              margin-bottom: 16px;
            }
            .qr-code img {
              width: 300px;
              height: 300px;
              display: block;
            }
            .instructions {
              font-size: 12px;
              color: #9ca3af;
              margin-top: 16px;
            }
            .hash-code {
              font-size: 10px;
              color: #9ca3af;
              margin-top: 8px;
              word-break: break-all;
            }
            @media print {
              body {
                padding: 0;
              }
              .instructions {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${product.product_name}</h1>
            <div class="product-details">
              <p><strong>Device Type:</strong> ${product.type_name || 'N/A'}</p>
              <p><strong>Location:</strong> ${product.location_name || 'N/A'}</p>
              <p><strong>Status:</strong> ${product.status}</p>
            </div>
            <div class="qr-code">
              <img src="${qrUrl}" alt="QR Code for ${product.product_name}" />
            </div>
            ${product.qr_code ? `<p class="hash-code">Hash: ${product.qr_code}</p>` : ''}
            <p class="instructions">Scan this QR code with the TAIN Scanner app</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <button onClick={onClose} className="product-modal-close">
          ×
        </button>

        <h2 className="product-modal-title">
          {product.product_name}
        </h2>

        <div className="product-modal-info">
          <p className="product-info-item">
            <strong>Device Type:</strong> {product.type_name || 'N/A'}
          </p>
          <p className="product-info-item">
            <strong>Purchase Year:</strong> {product.purchase_date}
          </p>
          <p className="product-info-item">
            <strong>Location:</strong> {product.location_name || 'N/A'}
          </p>
          <p className="product-info-item">
            <strong>Status:</strong> {product.status}
          </p>
          {product.details && (
            <p className="product-info-item">
              <strong>Details:</strong> {product.details}
            </p>
          )}
          {product.status === 'borrowed' && product.current_borrower_name && (
            <>
              <p className="product-info-item">
                <strong>Borrowed by:</strong> {product.current_borrower_name}
              </p>
              {product.estimated_return_date && (
                <p className="product-info-item">
                  <strong>Expected return:</strong> {new Date(product.estimated_return_date).toLocaleDateString('fi-FI')}
                </p>
              )}
            </>
          )}
        </div>

        <div className="product-modal-qr">
          <h3 className="qr-section-title">
            Product QR Code
          </h3>
          <QRCodeDisplay data={productData} />
        </div>

        <div className="product-modal-actions">
          <button onClick={handlePrint} className="product-modal-print-btn">
            🖨️ Print QR Code
          </button>
          <button onClick={onClose} className="product-modal-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default function Products({ currentUser }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    product_name: '', 
    device_type_id: '', 
    purchase_date: new Date().getFullYear(),
    location_id: '',
    status: 'available',
    details: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch products, device types, and locations in parallel
      const [productsRes, typesRes, locationsRes] = await Promise.all([
        fetch('/products'),
        fetch('/device-types'),
        fetch('/locations')
      ]);

      if (!productsRes.ok || !typesRes.ok || !locationsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const productsData = await productsRes.json();
      const typesData = await typesRes.json();
      const locationsData = await locationsRes.json();

      setProducts(productsData.items || []);
      setDeviceTypes(typesData.items || []);
      setLocations(locationsData.items || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.product_name.trim() || !formData.device_type_id || !formData.purchase_date) {
      alert('Please fill in all required fields (Product Name, Device Type, Purchase Year)');
      return;
    }

    try {
      const newProduct = {
        device_type_id: parseInt(formData.device_type_id),
        product_name: formData.product_name,
        purchase_date: parseInt(formData.purchase_date),
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        status: formData.status,
        details: formData.details || null,
        qr_code: generateHash() // Generate hash once and send to database
      };

      const response = await fetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      // Reload products from database
      await loadAllData();
      
      setFormData({ 
        product_name: '', 
        device_type_id: '', 
        purchase_date: new Date().getFullYear(),
        location_id: '',
        status: 'available',
        details: ''
      });
      setShowAddForm(false);
      alert(`Product "${formData.product_name}" added successfully and saved to database with unique hash!`);
    } catch (err) {
      console.error('Error adding product:', err);
      alert(`Failed to add product: ${err.message}`);
    }
  };

  const handleDelete = async (productId) => {
    if (currentUser?.role !== 'admin') return;
    
    const product = products.find(p => p.id === productId);
    if (!window.confirm(`Delete product "${product.product_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Reload products from database
      await loadAllData();
      alert(`Product "${product.product_name}" deleted from database.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please make sure the server is running.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type_name && p.type_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Custom status renderer for colored badges
  const renderStatus = (status) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status === 'available' ? 'Available' : 'Borrowed'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="products-card">
        <div className="products-card__header">
          <h2 className="title">Products</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading products from database...
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
        <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px', margin: '10px' }}>
          <p><strong>Error:</strong> {error}</p>
          <button 
            onClick={loadAllData}
            style={{ marginTop: '10px', padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
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
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-product-form">
          <div className="add-product-form-grid">
            <div>
              <label className="form-label">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Enter product name"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">
                Device Type *
              </label>
              <select
                value={formData.device_type_id}
                onChange={(e) => setFormData({ ...formData, device_type_id: e.target.value })}
                className="form-select"
              >
                <option value="">Select type...</option>
                {deviceTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.type_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">
                Purchase Year *
              </label>
              <input
                type="number"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">
                Location
              </label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="form-select"
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>
            <div>
              <label className="form-label">
                Details
              </label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Additional details"
                className="form-input"
              />
            </div>
            <button onClick={handleAddProduct} className="form-add-btn">
              Add to Database
            </button>
          </div>
        </div>
      )}

      <div className="products-card__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
              {currentUser?.role === 'admin' && (
                <th className="text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.product_name}</td>
                  <td>{p.type_name || 'N/A'}</td>
                  <td>{p.purchase_date}</td>
                  <td>{p.location_name || 'N/A'}</td>
                  <td>{renderStatus(p.status)}</td>
                  <td className="text-center">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="view-qr-btn"
                    >
                      View QR
                    </button>
                  </td>
                  {currentUser?.role === 'admin' && (
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="delete-btn"
                        aria-label="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentUser?.role === 'admin' ? '7' : '6'} className="empty-state">
                  {searchTerm ? 'No products found matching your search.' : 'No products in database. Add your first product!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

