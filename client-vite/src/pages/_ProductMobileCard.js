import React from "react";

export default function ProductMobileCard({
  product,
  currentUser,
  onViewQR,
  onEdit,
  onDelete,
  renderStatus,
}) {
  const p = product;

  return (
    <div className="products-mobile-card">
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
      <div className="products-mobile-card-actions">
        <button onClick={onViewQR} className="view-qr-btn">
          View QR
        </button>
        {currentUser?.role === "admin" && (
          <>
            <button
              onClick={onEdit}
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
              onClick={onDelete}
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
  );
}

