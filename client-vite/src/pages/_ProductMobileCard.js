import React from "react";

export default function ProductMobileCard({ product, renderStatus }) {
  const p = product;

  return (
    <>
      <div className="products-mobile-card-header">
        <div className="products-mobile-card-title">{p.product_name}</div>
        <div className="products-mobile-card-status">
          {renderStatus(p.status)}
        </div>
      </div>
      <div className="products-mobile-card-row">
        <span className="products-mobile-card-label">Device Type:</span>
        <span className="products-mobile-card-value">
          {p.type_name || "N/A"}
        </span>
      </div>
      <div className="products-mobile-card-row">
        <span className="products-mobile-card-label">Purchase Year:</span>
        <span className="products-mobile-card-value">{p.purchase_date}</span>
      </div>
      <div className="products-mobile-card-row">
        <span className="products-mobile-card-label">Location:</span>
        <span className="products-mobile-card-value">
          {p.location_name || "N/A"}
        </span>
      </div>
    </>
  );
}

