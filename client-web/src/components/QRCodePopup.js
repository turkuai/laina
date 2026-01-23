import React, { useState } from 'react';
import { generateQRCodeWithInfo } from '../utils/qrCodeUtils';

function QRCodePopup({ ref, product, onClose }) {

    const productData = JSON.stringify({
        id: product.id,
        name: product.product_name,
        deviceType: product.type_name,
        purchaseDate: product.purchase_date,
        location: product.location_name,
        status: product.status,
        details: product.details,
        qr_code: product.qr_code,
    });

    const handleDownload = async () => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productData)}`;
        
        try {
            const blob = await generateQRCodeWithInfo(qrUrl, product);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${product.product_name}-qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating QR code with info:', error);
            alert('Failed to download QR code. Please try again.');
        }
    };

    const dialog = React.useRef(null);

    React.useImperativeHandle(ref, () => {
        return {
            open() {
                dialog.current.showModal();
            }
        };
    }, [])
    

    return (
        <dialog onClick={(e) => e.target === e.currentTarget && dialog.current.close()} ref={dialog} className="qr-code-container">
            <div className="qr-code-content">

                <h2>{product.product_name}</h2>

                <div className="qr-code-image" style={{
                    background: `url("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(productData)}")`,
                    backgroundSize: '250px 250px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '250px',
                    height: '250px',
                }}>
                </div>
            </div>
            <div>
                <button onClick={handleDownload} style={{margin: '10px 0'}}>
                    Print
                </button>
            </div>
        </dialog>
    );
}

export default QRCodePopup; 
