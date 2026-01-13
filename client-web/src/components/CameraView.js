import React from 'react';
import './Admin.css';

// Helper function to format date as DD.MM.YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Helper function to get current date formatted
const getCurrentDate = () => {
  return formatDate(new Date());
};

 
function CameraView({ 
  currentUser, 
  onScanClick, 
  scannedProduct, 
  productStatus, 
  onReturn, 
  onBorrow 
}) {
  return (
    <div className="borrow-content">
      {currentUser?.role !== 'student' && (
        <button
          onClick={onScanClick}
          className="scan-button"
        >
          SCAN QR CODE
        </button>
      )}

      {currentUser?.role !== 'student' && (
        <p className="help-text">
          Press the button to scan a product QR code
        </p>
      )}

      {/* Mobile Product Info Box */}
      {scannedProduct && (
        <div className="mobile-product-box">
          <h3 className="mobile-product-title">{scannedProduct.name}</h3>
          <div className="mobile-product-status">
            {productStatus === 'borrowed' ? 'Lainassa' : 'Vapaa'}
          </div>

          {productStatus === 'borrowed' ? (
            <>
              <div className="mobile-info-section">
                <p className="mobile-label">Lainaataan:</p>
                <p className="mobile-value">Nimi: {scannedProduct.borrower}</p>
                <p className="mobile-value">Pvm: {scannedProduct.borrowDate}</p>
              </div>
              <div className="mobile-info-section">
                <p className="mobile-label">Viimeinen palautuspäivä:</p>
                <p className="mobile-value">{scannedProduct.returnDate}</p>
              </div>
            </>
          ) : (
            <div className="mobile-info-section">
              <p className="mobile-label">Lainaataan:</p>
              <input
                type="text"
                placeholder="Nimi:"
                className="mobile-input"
                id="mobile-borrower-name"
              />
              <input
                type="tel"
                placeholder="Pvm:"
                className="mobile-input"
                id="mobile-borrower-phone"
              />
              <p className="mobile-label">Viimeinen palautuspäivä:</p>
              <input
                type="text"
                placeholder="dd.mm.yyyy"
                className="mobile-input"
                id="mobile-return-date"
              />
            </div>
          )}

          <button
            onClick={() => {
              if (productStatus === 'borrowed') {
                onReturn();
              } else {
                const name = document.getElementById('mobile-borrower-name').value;
                const phone = document.getElementById('mobile-borrower-phone').value;
                const returnDate = document.getElementById('mobile-return-date').value;
                if (!name || !phone || !returnDate) {
                  alert('Fill in all fields!');
                  return;
                }
                onBorrow({
                  borrowerName: name,
                  borrowerPhone: phone,
                  returnDate: returnDate,
                  borrowDate: getCurrentDate()
                });
              }
            }}
            className="mobile-action-button"
          >
            {productStatus === 'borrowed' ? 'Palauta' : 'Lainaa'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraView;