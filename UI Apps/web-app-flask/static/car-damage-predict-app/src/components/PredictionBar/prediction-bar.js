import React from 'react';
import './bar.css';

function PredictionBar({ label, width, percent }) {
    return (
        <div className={`bar progress ${label}`}
            style={{width: `${width}%`}}>
            {label} - {percent}
        </div>
    )
}

export default PredictionBar;