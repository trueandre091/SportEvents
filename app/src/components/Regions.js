import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FSPLogo from './FSPLogo';
import './MainLanding.css';

function Regions() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const navItems = [
        { title: "профиль", path: "/profile" },
        { title: "регионы", path: "/regions" },
        { title: "события", path: "/events" },
        { title: "контакты", path: "/contacts" },
        { title: "антидопинг", path: "/antidoping" }
    ];

    const regions = [
        { id: 1, name: "Москва", participants: 1200, events: 15 },
        { id: 2, name: "Санкт-Петербург", participants: 800, events: 10 },
        { id: 3, name: "Казань", participants: 500, events: 8 },
        { id: 4, name: "Новосибирск", participants: 400, events: 6 },
        { id: 5, name: "Екатеринбург", participants: 350, events: 5 },
        { id: 6, name: "Нижний Новгород", participants: 300, events: 4 }
    ];

    const handleNavigation = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="landing-page">
            <header className="header-container">
                <div className="header-content">
                    <div 
                        className="logo-container"
                        onClick={() => handleNavigation('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FSPLogo className="h-10 w-10" />
                        <span className="logo-text">ФСП</span>
                    </div>
                    
                    {/* Десктопное меню */}
                    <nav className="nav-menu">
                        {navItems.map((item) => (
                            <button
                                key={item.title}
                                className="nav-link"
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>

                    {/* Кнопка мобильного меню */}
                    <button 
                        className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={toggleMobileMenu}
                    >
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>

                    {/* Мобильное меню */}
                    <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                        <div className="mobile-menu-title">Меню</div>
                        {navItems.map((item) => (
                            <button
                                key={item.title}
                                className="nav-link"
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="regions-content">
                <h1 className="page-title">Регионы</h1>
                <div className="regions-grid">
                    {regions.map(region => (
                        <div key={region.id} className="region-card">
                            <h3 className="region-name">{region.name}</h3>
                            <div className="region-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Участников:</span>
                                    <span className="stat-value">{region.participants}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Мероприятий:</span>
                                    <span className="stat-value">{region.events}</span>
                                </div>
                            </div>
                            <button className="region-button">
                                Подробнее
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Regions; 