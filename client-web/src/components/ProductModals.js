import React from 'react';
import './Admin.css';

/**
 * ProductModals component - Desktop modals for product borrow/return actions
 * @param {Object} scannedProduct - Scanned product object with name, borrower, borrowDate, returnDate
 * @param {string} productStatus - Product status ('borrowed' or 'available')
 * @param {Function} onClose - Handler to close the modal
 * @param {Function} onReturn - Handler for return button click
 * @param {Function} onBorrow - Handler for borrow button click, receives borrowData object
 * @param {Function} getCurrentDate - Function to get current date formatted
 */
const ProductModals = ({ scannedProduct, productStatus, onClose, onReturn, onBorrow, getCurrentDate }) => {
  if (!scannedProduct) return null;

  const handleBorrowClick = () => {
    const borrowerName = document.getElementById('desktop-borrower-name').value;
    const borrowerPhone = document.getElementById('desktop-borrower-phone').value;
    const returnDate = document.getElementById('desktop-return-date').value;
    if (!borrowerName || !borrowerPhone || !returnDate) {
      alert('Fill in all fields!');
      return;
    }
    onBorrow({
      borrowerName,
      borrowerPhone,
      returnDate,
      borrowDate: getCurrentDate()
    });
  };

  return (
    <div className="hide-on-mobile">
      {productStatus === 'borrowed' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={onClose} className="modal-close">×</button>
            <h2 className="modal-title">{scannedProduct.name}</h2>
            <div className="modal-status"><h3 className="status-borrowed">Borrowed</h3></div>
            <div className="modal-content">
              <p className="info-label">Borrowed by:</p>
              <p className="info-value">{scannedProduct.borrower}</p>
              <p className="info-value">{scannedProduct.borrowDate}</p>
              <p className="info-label">Return deadline:</p>
              <p className="info-value">{scannedProduct.returnDate}</p>
              <p className="info-label">Return date:</p>
              <div className="return-date-display">{getCurrentDate()}</div>
            </div>
            <button onClick={onReturn} className="modal-action-btn">Return</button>
          </div>
        </div>
      )}

      {productStatus === 'available' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={onClose} className="modal-close">×</button>
            <h2 className="modal-title">{scannedProduct.name}</h2>
            <div className="modal-status"><h3 className="status-available">Available</h3></div>
            <div className="modal-content">
              <div className="info-input-wrapper">
                <label className="info-label">Borrowing to:</label>
                <input type="text" placeholder="Name:" className="info-input" id="desktop-borrower-name" />
              </div>
              <div className="info-input-wrapper">
                <input type="tel" placeholder="Phone:" className="info-input" id="desktop-borrower-phone" />
              </div>
              <div className="info-input-wrapper">
                <label className="info-label">Return deadline:</label>
                <input type="text" placeholder="dd.mm.yyyy" className="info-input" id="desktop-return-date" />
              </div>
            </div>
            <button
              onClick={handleBorrowClick}
              className="modal-action-btn"
            >
              Borrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModals;
