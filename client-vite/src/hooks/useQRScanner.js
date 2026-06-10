import { useState } from 'react';
import { useNotification } from '../components/NotificationContext';
import { getApiBase } from '../config';

export const useQRScanner = (onProductsRefresh, currentUser) => {
  const { showNotification } = useNotification();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [productStatus, setProductStatus] = useState(null);

  const fetchProductByQR = async (productId) => {
    try {
      const res = await fetch(`${getApiBase()}/api/products/${productId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  const handleQRScan = async (qrData) => {
    console.log('QR Code scanned:', qrData);
    setShowCamera(false);

    let productId;
    const trimmed = qrData.trim();

    if (/^\d+$/.test(trimmed)) {
      productId = trimmed;
    } else {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.id) {
          productId = String(parsed.id);
        } else if (parsed.qr_code && /^\d+$/.test(parsed.qr_code)) {
          productId = parsed.qr_code;
        } else {
          showNotification('QR code format not recognized. Please use a current QR sticker or enter the product number manually.', 'error');
          return;
        }
      } catch (e) {
        showNotification('Invalid QR code. Please enter the product number manually.', 'error');
        return;
      }
    }

    const product = await fetchProductByQR(productId);

    if (!product) {
      showNotification('Product not found in database. Please check the QR code.', 'error');
      return;
    }

    const dbStatus = product.status || 'available';
    setProductStatus(dbStatus);

    if (dbStatus === 'borrowed') {
      try {
        const historyRes = await fetch(`${getApiBase()}/api/borrowing-history?page=1`, {
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
            qrCode: productId,
            borrowId: activeBorrow?.id
          });
        } else {
          setScannedProduct({
            id: product.id,
            name: product.product_name,
            borrower: 'Unknown',
            borrowDate: 'Unknown',
            returnDate: 'Unknown',
            qrCode: productId
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
          qrCode: productId
        });
      }
    } else {
      setScannedProduct({
        id: product.id,
        name: product.product_name,
        qrCode: productId
      });
    }
  };

  const handleReturn = async () => {
    if (!scannedProduct?.id || !scannedProduct?.borrowId) {
      showNotification('Cannot return: Missing product or borrow record information.', 'error');
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/borrowing-history/${scannedProduct.borrowId}`, {
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
      if (typeof onProductsRefresh === 'function') onProductsRefresh();
      setScannedProduct(null);
      setProductStatus(null);
    } catch (err) {
      console.error('Return error:', err);
      showNotification(`Failed to return product: ${err.message}`, 'error');
    }
  };

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
      const res = await fetch(`${getApiBase()}/api/borrowing-history`, {
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
      if (typeof onProductsRefresh === 'function') onProductsRefresh();
      setScannedProduct(null);
      setProductStatus(null);
    } catch (err) {
      console.error('Borrow error:', err);
      showNotification(`Failed to borrow product: ${err.message}`, 'error');
    }
  };

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