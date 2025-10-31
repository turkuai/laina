import React from 'react';

export default function Products({ currentUser, borrowingHistory, productsData }) {
  return (
    <div>
      <h2>Products</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Product Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Category</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {productsData && productsData.length > 0 ? (
            productsData.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.category}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '12px' }}>
                No products available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
