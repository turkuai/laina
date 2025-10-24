import QRScannerCamera from './QRScannerCamera';

function ParentComponent() {
  const [showCamera, setShowCamera] = useState(false);

  const handleQRCodeScanned = (qrData) => {
    console.log('Scanned QR code:', qrData);
    setShowCamera(false);
    // Tee jotain datalla...
  };

  return (
    <div>
      <button onClick={() => setShowCamera(true)}>
        Scan QR Code
      </button>

      {showCamera && (
        <QRScannerCamera
          onScan={handleQRCodeScanned}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}