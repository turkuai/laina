import React, { useState } from 'react';

export default function Products({ currentUser, borrowingHistory, productsData }) {
  const defaultProducts = [
    { id: 1, name: 'Laptop Dell XPS', category: 'Electronics', status: 'Available' },
    { id: 2, name: 'Mouse Logitech', category: 'Electronics', status: 'Available' },
    { id: 3, name: 'Monitor Samsung', category: 'Electronics', status: 'On Loan' },
    { id: 4, name: 'Keyboard Mechanical', category: 'Electronics', status: 'Available' },
    { id: 5, name: 'Tablet iPad', category: 'Electronics', status: 'On Loan' },
    { id: 6, name: 'Headphones Sony', category: 'Audio', status: 'Available' },
    { id: 7, name: 'Camera Canon DSLR', category: 'Photography', status: 'On Loan' },
    { id: 8, name: 'Projector Epson', category: 'Electronics', status: 'Available' },
  ];

  const [products, setProducts] = useState(productsData || defaultProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', status: 'Available' });

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option>Available</option>
                <option>On Loan</option>
                <option>Maintenance</option>
              </select>
            </div>
            <button
              onClick={handleAddProduct}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Product Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Category</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            {currentUser?.role === 'admin' && (
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {products && products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.category}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.status}</td>
                {currentUser?.role === 'admin' && (
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
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
              <td colSpan={currentUser?.role === 'admin' ? '4' : '3'} style={{ textAlign: 'center', padding: '12px' }}>
                No products available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}