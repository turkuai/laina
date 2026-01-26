import React, { useState } from "react";
import { createPortal } from "react-dom";
import { generateQRCodeWithInfo } from "../utils/qrCodeUtils";

function QRCodePopup({ ref, product, onClose }) {
  const productData = JSON.stringify({
    id: product.id,
    name: product.product_name,
    deviceType: product.type_name,
    purchaseDate: product.purchase_date,
    location: product.location_name,
    status: product.status,
    details: product.details,
    qr_code: product.qr_code,
  });

  const handleDownload = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productData)}`;

    try {
      const blob = await generateQRCodeWithInfo(qrUrl, product);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${product.product_name}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating QR code with info:", error);
      alert("Failed to download QR code. Please try again.");
    }
  };

  const dialog = React.useRef(null);

  const handleClose = () => {
    dialog.current.close();
  };

  React.useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      },
    };
  }, []);

  const getPurchaseYear = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const dialogContent = (
    <dialog
      onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
      ref={dialog}
      className="qr-code-container"
    >
      <button className="qr-code-close" onClick={handleClose}>
        ×
      </button>

      <div className="qr-code-content">
        <h2 className="qr-code-title">{product.product_name}</h2>

        <div className="qr-code-info">
          <div className="qr-code-info-item">
            <span className="qr-code-info-label">Device Type:</span>
            <span className="qr-code-info-value">
              {product.type_name || "N/A"}
            </span>
          </div>
          <div className="qr-code-info-item">
            <span className="qr-code-info-label">Purchase Year:</span>
            <span className="qr-code-info-value">
              {getPurchaseYear(product.purchase_date)}
            </span>
          </div>
          <div className="qr-code-info-item">
            <span className="qr-code-info-label">Location:</span>
            <span className="qr-code-info-value">
              {product.location_name || "N/A"}
            </span>
          </div>
          <div className="qr-code-info-item">
            <span className="qr-code-info-label">Status:</span>
            <span className="qr-code-info-value">
              {product.status || "N/A"}
            </span>
          </div>
        </div>

        <div className="qr-code-display">
          <div
            className="qr-code-image"
            style={{
              background: `url("https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(productData)}")`,
              backgroundSize: "280px 280px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "280px",
              height: "280px",
            }}
          ></div>
          <p className="qr-code-label">QR Code</p>
        </div>

        <div className="qr-code-actions">
          <button className="qr-code-download-btn" onClick={handleDownload}>
            Download QR Code
          </button>
          <button className="qr-code-close-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );

  return createPortal(dialogContent, document.body);
}

export default QRCodePopup;
