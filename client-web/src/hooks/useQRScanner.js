import { useState } from 'react';
import { getCurrentDate } from '../utils/dateUtils';
import { useNotification } from '../components/NotificationContext';

/**
 * Custom hook for managing QR scanner state and handlers
 * @param {Function} onProductsRefresh - Callback to refresh products list after borrow/return
 * @param {Object} currentUser - Current authenticated user object
 * @returns {Object} Object containing camera state, scanned product state, and handler functions
 */
export const useQRScanner = (onProductsRefresh, currentUser) => {
  const { showNotification } = useNotification();
  // QR Scanner states
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);

  // Fetch product from database by QR code
  const fetchProductByQR = async (qrCode) => {
    try {
      const res = await fetch('/api/products?page=1', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || data.data || []);
      
      // Find product by qr_code
      const product = products.find(p => p.qr_code === qrCode);
      return product;
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  // QR Scanner handler - processes scanned QR code data and fetches status from database
  const handleQRScan = async (qrData) => {
    console.log('QR Code scanned:', qrData);
    setShowCamera(false);

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (e) {
      showNotification('Invalid QR code format. Please use a JSON-based QR sticker.', 'error');
      console.error('QR parse error:', e);
      return;
    }

    if (!parsed.qr_code && !parsed.name) {
      showNotification('QR code missing required fields (qr_code or name).', 'error');
      return;
    }

    // Fetch product from database using QR code
    const product = await fetchProductByQR(parsed.qr_code);
    
    if (!product) {
      showNotification('Product not found in database. Please check the QR code.', 'error');
      return;
    }

    // Use database status instead of QR code status
    const dbStatus = product.status || 'available';
    setProductStatus(dbStatus);

    // Fetch borrowing history to get borrower info if borrowed
    if (dbStatus === 'borrowed') {
      try {
        const historyRes = await fetch('/api/borrowing-history?page=1', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          const history = Array.isArray(historyData) ? historyData : (historyData.history || historyData.data || []);
          const activeBorrow = history.find(h => 
            h.product_id === product.id && 
            (!h.actual_return_date || h.actual_return_date === null)
          );
          
          setScannedProduct({
            id: product.id,
            name: product.product_name,
            borrower: activeBorrow?.borrower_name || 'Unknown',
            borrowDate: activeBorrow?.borrow_date || 'Unknown',
            returnDate: activeBorrow?.estimated_return_date || 'Unknown',
            qrCode: parsed.qr_code,
            borrowId: activeBorrow?.id
          });
        } else {
          setScannedProduct({
            id: product.id,
            name: product.product_name,
            borrower: 'Unknown',
            borrowDate: 'Unknown',
            returnDate: 'Unknown',
            qrCode: parsed.qr_code
          });
        }
      } catch (err) {
        console.error('Error fetching borrowing history:', err);
        setScannedProduct({
          id: product.id,
          name: product.product_name,
          borrower: 'Unknown',
          borrowDate: 'Unknown',
          returnDate: 'Unknown',
          qrCode: parsed.qr_code
        });
      }
    } else {
      setScannedProduct({
        id: product.id,
        name: product.product_name,
        qrCode: parsed.qr_code
      });
    }
  };

  // Handler for returning a product - updates database
  const handleReturn = async () => {
    if (!scannedProduct?.id || !scannedProduct?.borrowId) {
      showNotification('Cannot return: Missing product or borrow record information.', 'error');
      return;
    }

    try {
      // Update borrowing record to mark as returned
      const res = await fetch(`/api/borrowing-history/${scannedProduct.borrowId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actual_return_date: new Date().toISOString(),
          return_processed_by: currentUser?.id || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to return product');
      }

      showNotification(`Product "${scannedProduct.name}" returned successfully!`, 'success');
      
      // Refresh products list to show updated status
      if (typeof onProductsRefresh === 'function') {
        onProductsRefresh();
      }
      
      setScannedProduct(null);
      setProductStatus(null);
    } catch (err) {
      console.error('Return error:', err);
      showNotification(`Failed to return product: ${err.message}`, 'error');
    }
  };

  // Handler for borrowing a product - creates database record
  const handleBorrow = async (borrowData) => {
    if (!scannedProduct?.id) {
      showNotification('Cannot borrow: Missing product information.', 'error');
      return;
    }

    if (!borrowData.selectedUser?.id) {
      showNotification('Please select a user to borrow the product.', 'error');
      return;
    }

    try {
      // Parse return date.
      // Supports either 'dd.mm.yyyy' or HTML date 'yyyy-mm-dd' formats.
      let estimatedReturnDate = '';
      if (borrowData.returnDate.includes('.')) {
        const [day, month, year] = borrowData.returnDate.split('.');
        estimatedReturnDate = `${year}-${month}-${day}`;
      } else if (borrowData.returnDate.includes('-')) {
        const [year, month, day] = borrowData.returnDate.split('-');
        estimatedReturnDate = `${year}-${month}-${day}`;
      } else {
        throw new Error('Invalid return date format.');
      }

      // Create borrowing record
      const res = await fetch('/api/borrowing-history', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: scannedProduct.id,
          borrower_id: borrowData.selectedUser.id,
          lender_id: currentUser?.id || null,
          estimated_return_date: estimatedReturnDate,
          notes: borrowData.notes || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to borrow product');
      }

      showNotification(`Product "${scannedProduct.name}" borrowed successfully!`, 'success');
      
      // Refresh products list to show updated status
      if (typeof onProductsRefresh === 'function') {
        onProductsRefresh();
      }
      
      setScannedProduct(null);
      setProductStatus(null);
    } catch (err) {
      console.error('Borrow error:', err);
      showNotification(`Failed to borrow product: ${err.message}`, 'error');
    }
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
