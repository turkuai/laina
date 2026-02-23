import QRScannerCamera from './QRScannerCamera';
import React, { useState } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './BorrowPage.css';
import { useNotification } from '../components/NotificationContext';

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

// Product Modal - BORROWED (Lainassa)
const ProductModalBorrowed = ({ product, onClose, onReturn }) => {
  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close">
          ×
        </button>

        <h2 className="modal-title">{product.name}</h2>

        <div className="modal-status">
          <h3 className="status-borrowed">Borrowed</h3>
        </div>

        <div className="modal-content">
          <p className="info-label">Borrowed by:</p>
          <p className="info-value">{product.borrower}</p>
          <p className="info-value">{product.borrowDate}</p>
          
          <p className="info-label">Return deadline:</p>
          <p className="info-value">{product.returnDate}</p>
          
          <p className="info-label">Return date:</p>
          <div className="return-date-display">
            {getCurrentDate()}
          </div>
        </div>

        <button onClick={onReturn} className="modal-action-btn">
          Return
        </button>
      </div>
    </div>
  );
};

// Product Modal - AVAILABLE (Vapaa)
const ProductModalAvailable = ({ product, onClose, onBorrow }) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [returnDate, setReturnDate] = useState('');

  if (!product) return null;

  const handleBorrow = () => {
    if (!borrowerName || !borrowerPhone || !returnDate) {
      // Use window-level notification via event to avoid hook usage inside nested component
      const event = new CustomEvent('app-notification', {
        detail: { message: 'Fill in all fields!', type: 'error' }
      });
      window.dispatchEvent(event);
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
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close">
          ×
        </button>

        <h2 className="modal-title">{product.name}</h2>

        <div className="modal-status">
          <h3 className="status-available">Available</h3>
        </div>

        <div className="modal-content">
          <div className="info-input-wrapper">
            <label className="info-label">Borrowing to:</label>
            <input
              type="text"
              placeholder="Name:"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="info-input"
            />
          </div>
          
          <div className="info-input-wrapper">
            <input
              type="tel"
              placeholder="Phone:"
              value={borrowerPhone}
              onChange={(e) => setBorrowerPhone(e.target.value)}
              className="info-input"
            />
          </div>
          
          <div className="info-input-wrapper">
            <label className="info-label">Return deadline:</label>
            <input
              type="text"
              placeholder="dd.mm.yyyy"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="info-input"
            />
          </div>
        </div>

        <button onClick={handleBorrow} className="modal-action-btn">
          Borrow
        </button>
      </div>
    </div>
  );
};

// Main Borrow Page Component
function BorrowPage() {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);
  const { showNotification } = useNotification();

  // Updated to use real QR sticker data
  const handleQRCodeScanned = (qrData) => {
    console.log('Scanned QR code:', qrData);
    setShowCamera(false);

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (e) {
      showNotification('Invalid QR code format. Please use a JSON-based QR sticker.', 'error');
      console.error('QR parse error:', e);
      return;
    }

    if (!parsed.name || !parsed.status) {
      showNotification('QR code missing required fields (name/status).', 'error');
      return;
    }

    if (parsed.status.toLowerCase() === 'borrowed') {
      setProductStatus('borrowed');
      setScannedProduct({
        name: parsed.name,
        borrower: parsed.borrower || 'Unknown',
        borrowDate: parsed.borrowDate || 'Unknown',
        returnDate: parsed.returnDate || 'Unknown',
        qrCode: qrData
      });
    } else if (parsed.status.toLowerCase() === 'available') {
      setProductStatus('available');
      setScannedProduct({
        name: parsed.name,
        qrCode: qrData
      });
    } else {
      showNotification(`Unknown product status: ${parsed.status}`, 'error');
    }
  };

  const handleReturn = () => {
    const currentDate = getCurrentDate();
    console.log('Returning product:', scannedProduct, 'on', currentDate);
    showNotification(`Product returned successfully! Return date: ${currentDate}`, 'success');
    setScannedProduct(null);
    setProductStatus(null);
  };

  const handleBorrow = (borrowData) => {
    console.log('Borrowing product:', scannedProduct);
    console.log('Borrow data:', borrowData);
    showNotification(
      `Product borrowed successfully! Borrower: ${borrowData.borrowerName}, Borrow date: ${borrowData.borrowDate}, Return by: ${borrowData.returnDate}`,
      'success'
    );
    setScannedProduct(null);
    setProductStatus(null);
  };

  return (
    <div className="borrow-page">
      {/* Header */}
      {/* <header className="borrow-header">
        <button 
          onClick={() => navigate('/home')}
          className="header-back-btn"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="header-title">TAIN Scanner</h1>
        <button className="header-menu-btn">
          <Menu className="w-8 h-8" />
        </button>
      </header> */}

      {/* Content Area */}
      <div className="borrow-content">
        <button
          onClick={() => setShowCamera(true)}
          className="scan-button"
        >
          Scan QR Code
        </button>
        
        <p className="help-text">
          Press the button to scan a product QR code
        </p>
      </div>

      {/* Camera Scanner */}
      {showCamera && (
        <QRScannerCamera
          onScan={handleQRCodeScanned}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Product Modals */}
      {scannedProduct && productStatus === 'borrowed' && (
        <ProductModalBorrowed
          product={scannedProduct}
          onClose={() => {
            setScannedProduct(null);
            setProductStatus(null);
          }}
          onReturn={handleReturn}
        />
      )}

      {scannedProduct && productStatus === 'available' && (
        <ProductModalAvailable
          product={scannedProduct}
          onClose={() => {
            setScannedProduct(null);
            setProductStatus(null);
          }}
          onBorrow={handleBorrow}
        />
      )}
    </div>
  );
}

export default BorrowPage;
