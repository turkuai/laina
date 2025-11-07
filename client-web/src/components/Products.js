import React, { useMemo, useState } from 'react';
import Grid from './Grid';
import './Products.css';

const initialProducts = [
  { id: 1, name: 'Laptop', description: 'Dell XPS 15', totalQty: 10, available: 7, onLoan: 3 },
  { id: 2, name: 'Tablet', description: 'iPad Pro', totalQty: 15, available: 12, onLoan: 3 },
  { id: 3, name: 'Calculator', description: 'Scientific Calculator', totalQty: 30, available: 25, onLoan: 5 },
  { id: 4, name: 'Camera', description: 'Canon DSLR', totalQty: 5, available: 3, onLoan: 2 },
  { id: 5, name: 'Projector', description: 'Epson EH-TW7000', totalQty: 8, available: 6, onLoan: 2 },
];

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.description].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [products, query]);

  const handleDelete = (row) => {
    if (window.confirm(`Delete product "${row.name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== row.id));
    }
  };

  const handleEdit = (row) => {
    // For now, editing is handled by the shared Grid modal
    console.log('Edit product', row);
  };

  const handleDataChange = (updated) => setProducts(updated);

  const columns = ['name', 'description', 'totalQty', 'available', 'onLoan'];

  return (
    <div className="products-card">
      <div className="products-card__header">
        <div className="title">Product Management</div>
        <button className="btn btn-primary" onClick={() => alert('Add Product')}>+ Add Product</button>
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
          allowEditing={true}
          pageSize={10}
          height="520px"
          onDataChange={handleDataChange}
          onEditRow={handleEdit}
          onDeleteRow={handleDelete}
        />
      </div>
    </div>
  );
}
