import React from 'react';
import QRCodePopup from './QRCodePopup';

function QRCodeRenderer(props) {

    const popup = React.useRef(null);

    return (
        <div>
            <button class="view-qr-btn" onClick={() => popup.current.open()}>QR Code</button>
            <QRCodePopup ref={popup} product={props.data} />
        </div >
    )
}

export default QRCodeRenderer;
