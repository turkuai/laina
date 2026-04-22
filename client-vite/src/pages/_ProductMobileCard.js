import React from "react";

export default function ProductMobileCard({ product, renderStatus }) {
  const p = product;

  return (
    <>
      <div className="mobile-card-header">
        <div className="mobile-card-title">{p.product_name}</div>
        <div className="mobile-card-status">
          {renderStatus(p.status)}
        </div>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Device Type:</span>
        <span className="mobile-card-value">
          {p.type_name || "N/A"}
        </span>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Purchase Year:</span>
        <span className="mobile-card-value">{p.purchase_date}</span>
      </div>
      <div className="mobile-card-row">
        <span className="mobile-card-label">Location:</span>
        <span className="mobile-card-value">
          {p.location_name || "N/A"}
        </span>
      </div>
    </>
  );
}

