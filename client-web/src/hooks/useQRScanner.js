import { useState } from 'react';
import { getCurrentDate } from '../utils/dateUtils';

/**
 * Custom hook for managing QR scanner state and handlers
 * @returns {Object} Object containing camera state, scanned product state, and handler functions
 */
export const useQRScanner = () => {
  // QR Scanner states
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);

  // QR Scanner handler - processes scanned QR code data
  const handleQRScan = (qrData) => {
    console.log('QR Code scanned:', qrData);
    setShowCamera(false);

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (e) {
      alert('Invalid QR code format. Please use a JSON-based QR sticker.');
      console.error('QR parse error:', e);
      return;
    }

    if (!parsed.name || !parsed.status) {
      alert('QR code missing required fields (name/status).');
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
      alert(`Unknown product status: ${parsed.status}`);
    }
  };

  // Handler for returning a product
  const handleReturn = () => {
    const currentDate = getCurrentDate();
    console.log('Returning product:', scannedProduct, 'on', currentDate);
    alert(`Product returned successfully!\nReturn date: ${currentDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  // Handler for borrowing a product
  const handleBorrow = (borrowData) => {
    console.log('Borrowing product:', scannedProduct);
    console.log('Borrow data:', borrowData);
    alert(`Product borrowed successfully!\nBorrower: ${borrowData.borrowerName}\nBorrow date: ${borrowData.borrowDate}\nReturn by: ${borrowData.returnDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  // Handler for closing/resetting the scanned product modal
  const handleClose = () => {
    setScannedProduct(null);
    setProductStatus(null);
  };

  return {
    showCamera,
    setShowCamera,
    scannedProduct,
    productStatus,
    handleQRScan,
    handleReturn,
    handleBorrow,
    handleClose
  };
};
