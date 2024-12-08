import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SimplePageLayout.css';

const SimplePageLayout = ({ children, title }) => {
    const navigate = useNavigate();

    return (
        <div className="simple-page">
            <button 
                className="back-to-main-button"
                onClick={() => navigate('/')}
            >
                На главную
            </button>
            <div className="simple-page-content">
                <h1 className="simple-page-title">{title}</h1>
                {children}
            </div>
        </div>
    );
};

export default SimplePageLayout; 