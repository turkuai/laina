import QRScannerCamera from './QRScannerCamera';

import React, { useState } from 'react';
import { X } from 'lucide-react';

// Your QR Scanner Component (unchanged)
const QRScannerCamera = ({ onScan, onClose }) => {
  const handleScanSuccess = (result) => {
    if (result && result[0]) {
      onScan(result[0].rawValue);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="aspect-square bg-gray-900 flex items-center justify-center">
            <p className="text-white text-center">Camera view would appear here</p>
          </div>
        </div>
        <p className="text-white text-center mt-4 text-lg italic">
          Point camera at QR code
        </p>
      </div>
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onBorrow }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-3xl leading-none text-gray-800 hover:text-gray-600 transition-colors"
        >
          ×
        </button>

        <h2 className="text-2xl italic text-gray-800 border-b-2 border-gray-800 pb-2 mb-5">
          {product.name}
        </h2>

        <ul className="mb-8">
          <li className="text-lg italic text-gray-600 mb-2">
            Category: {product.category}
          </li>
          <li className="text-lg italic text-gray-600 mb-2">
            Condition: {product.condition}
          </li>
          <li className="text-lg italic text-gray-600 mb-2">
            Available: {product.available ? 'Yes' : 'No'}
          </li>
        </ul>

        <button
          onClick={onBorrow}
          className="bg-[#c4a894] text-white border-none py-4 px-12 rounded-xl text-lg italic cursor-pointer block mx-auto transition-all hover:bg-[#b39682] hover:-translate-y-0.5 active:translate-y-0"
        >
          Borrow
        </button>
      </div>
    </div>
  );
};

// Main Borrow Page Component
function BorrowPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);

  const handleQRCodeScanned = (qrData) => {
    console.log('Scanned QR code:', qrData);
    setShowCamera(false);
    
    // Mock product data - replace with actual data fetch
    const mockProduct = {
      name: 'Product Name',
      category: 'Tools',
      condition: 'Good',
      available: true,
      qrCode: qrData
    };
    
    setScannedProduct(mockProduct);
  };

  const handleBorrow = () => {
    console.log('Borrowing product:', scannedProduct);
    alert('Product borrowed successfully!');
    setScannedProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#d4b5a8] flex flex-col items-center p-5">
      {/* Header */}
      <header className="w-full bg-white py-4 px-5 rounded-t-3xl mb-10">
        <h1 className="text-[#8b7355] text-4xl font-light italic tracking-wider">
          P&T
        </h1>
      </header>

      {/* QR Scan Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCamera(true)}
          className="bg-white text-gray-600 border-none py-5 px-20 rounded-2xl text-xl italic cursor-pointer shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          QR Scan
        </button>
      </div>

      {/* Camera Scanner */}
      {showCamera && (
        <QRScannerCamera
          onScan={handleQRCodeScanned}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Product Modal */}
      {scannedProduct && (
        <ProductModal
          product={scannedProduct}
          onClose={() => setScannedProduct(null)}
          onBorrow={handleBorrow}
        />
      )}
    </div>
  );
}

export default BorrowPage;
// muokattavissa