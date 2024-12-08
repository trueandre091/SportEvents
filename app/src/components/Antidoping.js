import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FSPLogo from './FSPLogo';
import './MainLanding.css';

function Antidoping() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const navItems = [
        { title: "профиль", path: "/profile" },
        { title: "регионы", path: "/regions" },
        { title: "события", path: "/events" },
        { title: "контакты", path: "/contacts" },
        { title: "антидопинг", path: "/antidoping" }
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

            <main className="antidoping-content">
                <h1 className="page-title">Антидопинг</h1>
                <div className="antidoping-container">
                    <p>Страница антидопинга в разработке</p>
                </div>
            </main>
        </div>
    );
}

export default Antidoping; 