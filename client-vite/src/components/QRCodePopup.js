import React, { useState } from "react";
import { createPortal } from "react-dom";
import { generateQRCodeWithInfo } from "../utils/qrCodeUtils";
import { useNotification } from "./NotificationContext";

function QRCodePopup({ ref, product, onClose }) {
  const { showNotification } = useNotification();
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
      showNotification("Failed to download QR code. Please try again.", "error");
    }
  };

  const dialog = React.useRef(null);

  const handleClose = () => {
    dialog.current.close();
  };

  const handlePrint = () => {
    window.print();
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

  const [qrLoading, setQrLoading] = useState(true);

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
          {qrLoading && (
            <div className="qr-code-spinner" aria-label="Generating QR code" />
          )}
          <img
            className="qr-code-image"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
              productData,
            )}`}
            alt="QR code for this product"
            onLoad={() => setQrLoading(false)}
            onError={() => setQrLoading(false)}
          />
          <p className="qr-code-label">QR Code</p>
        </div>

        <div className="qr-code-actions">
          <button className="qr-code-download-btn" onClick={handleDownload}>
            Download QR Code
          </button>
          <button className="qr-code-download-btn" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </dialog>
  );

  return createPortal(dialogContent, document.body);
}

export default QRCodePopup;
