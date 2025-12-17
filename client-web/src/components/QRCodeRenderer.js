import React from 'react';
import QRCodePopup from './QRCodePopup';

function QRCodeRenderer(props) {

    console.log(props);

    const [showPopup, setShowPopup] = React.useState(false)
    return (
        <div>
            <button class="view-qr-btn" onClick={() => setShowPopup(true)}>QR Code</button> 
            {showPopup && <QRCodePopup product={props.data} />}
        </div>
    )
}

export default QRCodeRenderer;
