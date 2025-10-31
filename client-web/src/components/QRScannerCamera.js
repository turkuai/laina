import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';

const QRScannerCamera = ({ onScan, onClose }) => {
  const handleScanSuccess = (result) => {
    if (result && result[0]) {
      // Kutsu callback-funktiota QR-koodin datalla
      onScan(result[0].rawValue);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Scanner */}
      <div className="w-full max-w-md p-4">
        <Scanner
          onScan={handleScanSuccess}
          onError={handleError}
          constraints={{
            facingMode: 'environment' // Käytä takakameraa
          }}
        />
        <p className="text-white text-center mt-4 text-lg">
          Point camera at QR code
        </p>
      </div>
    </div>
  );
};

export default QRScannerCamera;