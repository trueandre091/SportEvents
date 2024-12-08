import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <header className="sport-header">
            <div className="sport-header-content">
                <button 
                    className="back-button"
                    onClick={() => handleNavigation('/')}
                >
                    ← Вернуться на сайт ФСП
                </button>
                <h1 className="sport-header-title">КАЛЕНДАРЬ СОБЫТИЙ</h1>
                <div className="sport-header-actions">
                    <button 
                        className="filter-button"
                        onClick={() => handleNavigation('/sportevents/events')}
                    >
                        {window.location.pathname === '/sportevents/events' 
                            ? 'На главную' 
                            : 'Фильтр спортивных событий'
                        }
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header; 