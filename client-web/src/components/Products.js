import React, { useState, useEffect } from 'react';
import ServerGrid from './ServerGrid';
import './Products.css';

// Generate a unique 45-character hash
const generateHash = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 45; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

// Local Products Grid Component (fallback when database not available)
const LocalProductsGrid = ({ products, currentUser, renderStatus, renderActions, searchTerm, setSearchTerm }) => {
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
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
              <th>Category</th>
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
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{renderStatus(p.status)}</td>
                  <td className="text-center">
                    <button
                      onClick={() => renderActions(p).props.children[0].props.onClick()}
                      className="view-qr-btn"
                    >
                      View QR
                    </button>
                  </td>
                  {currentUser?.role === 'admin' && (
                    <td className="text-center">
                      <button
                        onClick={() => renderActions(p).props.children[1].props.onClick()}
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
                <td colSpan={currentUser?.role === 'admin' ? '5' : '4'} className="empty-state">
                  {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// QR Code Component
const QRCodeDisplay = ({ data }) => {
  return (
    <div className="qr-code-container">
      <div className="qr-code-image" style={{
        background: `url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}")`,
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
    name: product.name,
    category: product.category,
    status: product.status.toLowerCase() === 'on loan' ? 'borrowed' : 'available',
    hash: product.hash,
    ...(product.status.toLowerCase() === 'on loan' && {
      borrower: 'Current Borrower',
      borrowDate: new Date().toLocaleDateString('fi-FI'),
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fi-FI')
    })
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productData)}`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${product.name}</title>
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
            <h1>${product.name}</h1>
            <div class="product-details">
              <p><strong>Category:</strong> ${product.category}</p>
              <p><strong>Status:</strong> ${product.status}</p>
            </div>
            <div class="qr-code">
              <img src="${qrUrl}" alt="QR Code for ${product.name}" />
            </div>
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
          {product.name}
        </h2>

        <div className="product-modal-info">
          <p className="product-info-item">
            <strong>Category:</strong> {product.category}
          </p>
          <p className="product-info-item">
            <strong>Status:</strong> {product.status}
          </p>
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

export default function Products({ currentUser, productsData }) {
  const defaultProducts = [
    { id: 1, name: 'Laptop Dell XPS', category: 'Electronics', status: 'Available', hash: generateHash() },
    { id: 2, name: 'Mouse Logitech', category: 'Electronics', status: 'Available', hash: generateHash() },
    { id: 3, name: 'Monitor Samsung', category: 'Electronics', status: 'On Loan', hash: generateHash() },
    { id: 4, name: 'Keyboard Mechanical', category: 'Electronics', status: 'Available', hash: generateHash() },
    { id: 5, name: 'Tablet iPad', category: 'Electronics', status: 'On Loan', hash: generateHash() },
    { id: 6, name: 'Headphones Sony', category: 'Audio', status: 'Available', hash: generateHash() },
    { id: 7, name: 'Camera Canon DSLR', category: 'Photography', status: 'On Loan', hash: generateHash() },
    { id: 8, name: 'Projector Epson', category: 'Electronics', status: 'Available', hash: generateHash() },
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', status: 'Available' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [useLocalData, setUseLocalData] = useState(true); // Default to local data to show products
  const [localProducts, setLocalProducts] = useState(productsData || defaultProducts);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if database is available
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Database not available');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setUseLocalData(false);
        }
      })
      .catch(() => {
        setUseLocalData(true);
      });
  }, []);

  const handleAddProduct = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (useLocalData) {
      // Add to local data
      const newProduct = {
        id: Math.max(...localProducts.map(p => p.id), 0) + 1,
        name: formData.name,
        category: formData.category,
        status: formData.status,
        hash: generateHash(),
      };
      setLocalProducts([...localProducts, newProduct]);
      setFormData({ name: '', category: '', status: 'Available' });
      setShowAddForm(false);
      alert(`Product "${formData.name}" added successfully!`);
      return;
    }

    try {
      const newProduct = {
        name: formData.name,
        category: formData.category,
        status: formData.status,
        hash: generateHash(),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      setFormData({ name: '', category: '', status: 'Available' });
      setShowAddForm(false);
      setRefreshKey(prev => prev + 1);
      alert(`Product "${formData.name}" added successfully!`);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  // Handle delete for local data
  const handleLocalDelete = (productId) => {
    if (currentUser.role !== 'admin') return;
    const product = localProducts.find(p => p.id === productId);
    if (window.confirm(`Delete product "${product.name}"?`)) {
      setLocalProducts(localProducts.filter(p => p.id !== productId));
      alert(`Product "${product.name}" deleted.`);
    }
  };

  // Custom action renderer for QR code button
  const renderActions = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={() => setSelectedProduct(row)}
          className="view-qr-btn"
        >
          View QR
        </button>
        {useLocalData && currentUser?.role === 'admin' && (
          <button
            onClick={() => handleLocalDelete(row.id)}
            className="delete-btn"
            aria-label="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626"/>
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Custom status renderer for colored badges
  const renderStatus = (status) => {
    return (
      <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="products-card">
      <div className="products-card__header">
        <h2 className="title">Products</h2>
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
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
                className="form-input"
              />
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
                <option>Available</option>
                <option>On Loan</option>
                <option>Maintenance</option>
              </select>
            </div>
            <button onClick={handleAddProduct} className="form-add-btn">
              Add
            </button>
          </div>
        </div>
      )}

      {useLocalData ? (
        <LocalProductsGrid 
          products={localProducts}
          currentUser={currentUser}
          renderStatus={renderStatus}
          renderActions={renderActions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      ) : (
        <ServerGrid
          key={refreshKey}
          columns={['name', 'category', 'status']}
          path="/products"
          allowEditing={currentUser?.role === 'admin'}
          allowDelete={currentUser?.role === 'admin'}
          pageSize={10}
          customRenderers={{
            status: renderStatus,
          }}
          customActions={renderActions}
        />
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
