import React from 'react';
import './bar.css';

function PredictionBar({ label, width, percent }) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className='class-label'>{label}</span>&nbsp;<span className={`bar progress ${label.toLowerCase()}`} style={{width: percent }}>{percent}</span>
        </div>
    )
}

export default PredictionBar;