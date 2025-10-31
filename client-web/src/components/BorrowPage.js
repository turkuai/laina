import QRScannerCamera from './QRScannerCamera';
import React, { useState } from 'react';
import { X, Menu } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-3xl leading-none text-gray-800 hover:text-gray-600 transition-colors"
        >
          ×
        </button>

        <h2 className="text-2xl font-normal text-gray-800 border-b-2 border-gray-800 pb-2 mb-5">
          {product.name}
        </h2>

        <div className="border-b-2 border-gray-800 pb-2 mb-4">
          <h3 className="text-xl font-normal">Borrowed</h3>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-lg text-gray-700">
            <span className="font-medium">Borrowed by:</span>
          </p>
          <p className="text-base text-gray-600 pl-4">
            {product.borrower}
          </p>
          <p className="text-base text-gray-600 pl-4">
            {product.borrowDate}
          </p>
          
          <p className="text-lg text-gray-700 mt-4">
            <span className="font-medium">Return deadline:</span>
          </p>
          <p className="text-base text-gray-600 pl-4">
            {product.returnDate}
          </p>
          
          <p className="text-lg text-gray-700 mt-4">
            <span className="font-medium">Return date:</span>
          </p>
          <div className="pl-4 border-b border-gray-300 pb-1 w-3/4">
            <span className="text-gray-600">{getCurrentDate()}</span>
          </div>
        </div>

        <button
          onClick={onReturn}
          className="bg-[#8b7355] text-black border-2 border-gray-800 py-4 px-12 rounded-xl text-lg font-medium cursor-pointer block mx-auto transition-all hover:bg-[#755f46] hover:shadow-lg active:translate-y-0.5"
        >
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-3xl leading-none text-gray-800 hover:text-gray-600 transition-colors"
        >
          ×
        </button>

        <h2 className="text-2xl font-normal text-gray-800 border-b-2 border-gray-800 pb-2 mb-5">
          {product.name}
        </h2>

        <div className="border-b-2 border-gray-800 pb-2 mb-4">
          <h3 className="text-xl font-normal">Available</h3>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-lg text-gray-700 mb-2">
              Borrowing to:
            </label>
            <input
              type="text"
              placeholder="Name:"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="w-full border-b-2 border-gray-300 pb-1 focus:border-gray-800 outline-none text-base"
            />
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Phone:"
              value={borrowerPhone}
              onChange={(e) => setBorrowerPhone(e.target.value)}
              className="w-full border-b-2 border-gray-300 pb-1 focus:border-gray-800 outline-none text-base"
            />
          </div>
          
          <div>
            <label className="block text-lg text-gray-700 mb-2">
              Return deadline:
            </label>
            <input
              type="text"
              placeholder="dd.mm.yyyy"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full border-b-2 border-gray-300 pb-1 focus:border-gray-800 outline-none text-base"
            />
          </div>
        </div>

        <button
          onClick={handleBorrow}
          className="bg-[#8b7355] text-black border-2 border-gray-800 py-4 px-12 rounded-xl text-lg font-medium cursor-pointer block mx-auto transition-all hover:bg-[#755f46] hover:shadow-lg active:translate-y-0.5"
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
  const [productStatus, setProductStatus] = useState(null);

  // ✅ Updated to use real QR sticker data
  const handleQRCodeScanned = (qrData) => {
    console.log('Scanned QR code:', qrData);
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

  const handleReturn = () => {
    const currentDate = getCurrentDate();
    console.log('Returning product:', scannedProduct, 'on', currentDate);
    alert(`Product returned successfully!\nReturn date: ${currentDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  const handleBorrow = (borrowData) => {
    console.log('Borrowing product:', scannedProduct);
    console.log('Borrow data:', borrowData);
    alert(`Product borrowed successfully!\nBorrower: ${borrowData.borrowerName}\nBorrow date: ${borrowData.borrowDate}\nReturn by: ${borrowData.returnDate}`);
    setScannedProduct(null);
    setProductStatus(null);
  };

  return (
    <div className="min-h-screen bg-[#d4b5a8] flex flex-col">
      {/* Header */}
      <header className="w-full bg-white py-4 px-5 flex items-center justify-between border-b-2 border-gray-800">
        <h1 className="text-gray-800 text-3xl font-normal tracking-wide">
          P&T
        </h1>
        <button className="p-2">
          <Menu className="w-8 h-8 text-gray-800" />
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        <button
          onClick={() => setShowCamera(true)}
          className="bg-white text-gray-800 border-2 border-gray-800 py-6 px-24 rounded-2xl text-2xl cursor-pointer shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          Scan
        </button>
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
