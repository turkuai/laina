let htmlscanner = null;
let isScanning = false;

function onScanSuccess(decodeText, decodeResult) {
    alert("Your QR code is: " + decodeText);
    // Stop scanning after successful scan
    htmlscanner.clear();
    document.getElementById('my-qr-reader').style.display = 'none';
    document.getElementById('scanButton').textContent = 'QR Scan';
    isScanning = false;
}

function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    document.getElementById('scanButton').addEventListener('click', function() {
        const readerDiv = document.getElementById('my-qr-reader');
        
        if (!isScanning) {
            // Start scanning
            readerDiv.style.display = 'block';
            htmlscanner = new Html5QrcodeScanner(
                "my-qr-reader",
                { fps: 10, qrbox: 250 }  // Fixed: was "qrbos"
            );
            htmlscanner.render(onScanSuccess);
            this.textContent = 'Stop Scanning';
            isScanning = true;
        } else {
            // Stop scanning
            htmlscanner.clear();
            readerDiv.style.display = 'none';
            this.textContent = 'QR Scan';
            isScanning = false;
        }
    });
});