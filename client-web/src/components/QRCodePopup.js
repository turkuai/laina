import React from 'react';

function QRCodePopup({ product }) {

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

    return (
        <dialog className="qr-code-container">
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
        </dialog>
    );
}

export default QRCodePopup;
