import React from 'react';

function StatusRenderer(props) {
    console.log(props);
    return (
        <span className={`status-badge status-${props.value}`}>
            {props.value === 'available' ? 'Available' : 'Borrowed'}
        </span>
    );
}

export default StatusRenderer;