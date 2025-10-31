import React, { useMemo, useState, useEffect } from 'react';
import Grid from './Grid';
import './Products.css';

// ✅ All product data lives HERE (no separate file)
const allProducts = [
  { id: 1, name: 'Laptop Dell XPS', description: 'High-end laptop', totalQty: 10, available: 7, onLoan: 3 },
  { id: 2, name: 'Mouse Logitech', description: 'Wireless mouse', totalQty: 20, available: 18, onLoan: 2 },
  { id: 3, name: 'Monitor Samsung', description: '24-inch monitor', totalQty: 15, available: 13, onLoan: 2 },
  { id: 4, name: 'Keyboard Mechanical', description: 'Gaming keyboard', totalQty: 12, available: 10, onLoan: 2 },
  { id: 5, name: 'Tablet iPad', description: 'iPad Pro', totalQty: 8, available: 5, onLoan: 3 },
  { id: 6, name: 'Headphones Sony', description: 'Noise-canceling', totalQty: 6, available: 4, onLoan: 2 },
  { id: 7, name: 'Camera Canon DSLR', description: 'Professional camera', totalQty: 5, available: 3, onLoan: 2 },
  { id: 8, name: 'Projector Epson', description: 'HD projector', totalQty: 4, available: 3, onLoan: 1 },
];

export default function Products({ currentUser, borrowingHistory }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [visibleProducts, setVisibleProducts] = useState([]);

  // ✅ Load products once
  useEffect(() => {
    setProducts(allProducts);
  }, []);

  // ✅ Filter by role and borrowing history
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
      setVisibleProducts(products);
    } else {
      const borrowedProductNames = borrowingHistory
        .filter(r => r.userId === currentUser.id)
        .map(r => r.productName);

      setVisibleProducts(products.filter(p => borrowedProductNames.includes(p.name)));
    }
  }, [currentUser, borrowingHistory, products]);

  // ✅ Search filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleProducts;
    return visibleProducts.filter(p =>
      [p.name, p.description].some(v => String(v).toLowerCase().includes(q))
    );
  }, [visibleProducts, query]);

  // ✅ Delete (admin only)
  const handleDelete = (row) => {
    if (currentUser.role !== 'admin') return;
    if (window.confirm(`Delete product "${row.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== row.id));
    }
  };

  // ✅ Edit (admin only)
  const handleEdit = (row) => {
    if (currentUser.role !== 'admin') return;
    console.log('Edit product', row);
  };

  // ✅ Data change handler
  const handleDataChange = (updated) => setProducts(updated);

  const columns = ['name', 'description', 'totalQty', 'available', 'onLoan'];

  return (
    <div className="products-card">
      <div className="products-card__header">
        <div className="title">Product Management</div>
        {currentUser.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => alert('Add Product')}>
            + Add Product
          </button>
        )}
      </div>

      <div className="products-card__search">
        <input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="products-card__table">
        <Grid
          columns={columns}
          data={filtered}
          allowEditing={currentUser.role === 'admin'}
          pageSize={10}
          height="520px"
          onDataChange={handleDataChange}
          onEditRow={handleEdit}
          onDeleteRow={currentUser.role === 'admin' ? handleDelete : undefined}
        />
      </div>
    </div>
  );
}
