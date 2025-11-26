import React, { useState } from 'react';
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

// QR Code Component (simplified SVG-based QR code)
const QRCodeDisplay = ({ data }) => {
  // For a real implementation, you'd use a QR code library
  // This is a placeholder that shows the concept
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

export default function Products({ currentUser, borrowingHistory, productsData }) {
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

  const [products, setProducts] = useState(productsData || defaultProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', status: 'Available' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      alert('Please fill in all fields');
      return;
    }
    const newProduct = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name: formData.name,
      category: formData.category,
      status: formData.status,
      hash: generateHash(),
    };
    setProducts([...products, newProduct]);
    setFormData({ name: '', category: '', status: 'Available' });
    setShowAddForm(false);
    alert(`Product "${formData.name}" added successfully!`);
  };

  const handleDelete = (productId) => {
    if (currentUser.role !== 'admin') return;
    const product = products.find(p => p.id === productId);
    if (window.confirm(`Delete product "${product.name}"?`)) {
      setProducts(products.filter(p => p.id !== productId));
      alert(`Product "${product.name}" deleted.`);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>
                    <span className={`status-badge status-${p.status.toLowerCase().replace(' ', '-')}`}>
                      {p.status}
                    </span>
                  </td>
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
                <td colSpan={currentUser?.role === 'admin' ? '5' : '4'} className="empty-state">
                  {searchTerm ? 'No products found matching your search.' : 'No products available.'}
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
