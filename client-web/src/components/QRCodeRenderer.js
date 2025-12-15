import React from 'react';
import Products from './Products';

function QRCodeRenderer(props) {
    const [setShowPopup] = React.useState(false);
    const productData = {
        id: props.id,
        name: props.product_name,
        deviceType: props.type_name,
        purchaseDate: props.purchase_date,
        location: props.location_name,
        status: props.status,
        details: props.details,
        qr_code: props.qr_code,
        ...(props.status === 'borrowed' && props.current_borrower_name && {
        borrower: props.current_borrower_name,
        borrowDate: props.current_borrow_date,
        estimatedReturn: props.estimated_return_date
        })
    }
    
    return (
        <div>
            <button class="view-qr-btn" onClick={() => setShowPopup(true)}>QR Code</button>
        </div>
    );
}

export default QRCodeRenderer;