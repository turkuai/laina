import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';
import './QRScannerCamera.css';

const QRScannerCamera = ({ onScan, onClose }) => {
  const [cameraError, setCameraError] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleScanSuccess = (result) => {
    if (result && result[0]) {
      onScan(result[0].rawValue);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    setCameraError(true);
  };

  const handleCloseAttempt = () => {
    // If camera had error, show warning popup
    if (cameraError) {
      setShowErrorPopup(true);
    } else {
      // Camera worked fine, close normally
      onClose();
    }
  };

  const handleForceClose = () => {
    setShowErrorPopup(false);
    onClose();
  };

  return (
    <div className="camera-overlay">
      {/* Close button */}
      <button onClick={handleCloseAttempt} className="camera-close-btn">
        <X className="w-8 h-8" />
      </button>

      {/* Scanner - Always show */}
      <div className="scanner-container">
        <div className="scanner-frame">
          {/* Corner decorations */}
          <div className="scanner-corner corner-tl"></div>
          <div className="scanner-corner corner-tr"></div>
          <div className="scanner-corner corner-bl"></div>
          <div className="scanner-corner corner-br"></div>
          
          {/* Scanning line animation */}
          <div className="scanning-line"></div>
          
          <Scanner
            onScan={handleScanSuccess}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
          />
        </div>
        
        <div className="scanner-instructions">
          <p className="instruction-title">
            📷 Point camera at QR code
          </p>
          <p className="instruction-text">
            Align the QR code within the frame for automatic scanning
          </p>
        </div>
      </div>

      {/* Error Popup - Only shows when X is pressed and camera failed */}
      {showErrorPopup && (
        <div className="error-popup-overlay">
          <div className="error-popup">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Camera Not Available</h3>
            <p className="error-message">
              Unable to access camera. Please check your camera permissions or try using a different device.
            </p>
            <button onClick={handleForceClose} className="error-close-btn">
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerCamera;
