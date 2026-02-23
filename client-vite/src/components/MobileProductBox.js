import React from 'react';
import '../pages/Admin.css';
import { useNotification } from './NotificationContext';

/**
 * MobileProductBox component - Displays product information and action buttons for mobile view
 * @param {Object} product - Scanned product object with name, borrower, borrowDate, returnDate
 * @param {string} status - Product status ('borrowed' or 'available')
 * @param {Function} onReturn - Handler for return button click
 * @param {Function} onBorrow - Handler for borrow button click, receives borrowData object
 * @param {Function} getCurrentDate - Function to get current date formatted
 */
const MobileProductBox = ({ product, status, onReturn, onBorrow, getCurrentDate }) => {
  const { showNotification } = useNotification();

  if (!product) return null;

  const handleActionClick = () => {
    if (status === 'borrowed') {
      onReturn();
    } else {
      const name = document.getElementById('mobile-borrower-name').value;
      const phone = document.getElementById('mobile-borrower-phone').value;
      const returnDate = document.getElementById('mobile-return-date').value;
      if (!name || !phone || !returnDate) {
        showNotification('Fill in all fields!', 'error');
        return;
      }
      onBorrow({
        borrowerName: name,
        borrowerPhone: phone,
        returnDate: returnDate,
        borrowDate: getCurrentDate()
      });
    }
  };

  return (
    <div className="mobile-product-box">
      <h3 className="mobile-product-title">{product.name}</h3>
      <div className="mobile-product-status">
        {status === 'borrowed' ? 'Lainassa' : 'Vapaa'}
      </div>

      {status === 'borrowed' ? (
        <>
          <div className="mobile-info-section">
            <p className="mobile-label">Lainaataan:</p>
            <p className="mobile-value">Nimi: {product.borrower}</p>
            <p className="mobile-value">Pvm: {product.borrowDate}</p>
          </div>
          <div className="mobile-info-section">
            <p className="mobile-label">Viimeinen palautuspäivä:</p>
            <p className="mobile-value">{product.returnDate}</p>
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
        onClick={handleActionClick}
        className="mobile-action-button"
      >
        {status === 'borrowed' ? 'Palauta' : 'Lainaa'}
      </button>
    </div>
  );
};

export default MobileProductBox;
