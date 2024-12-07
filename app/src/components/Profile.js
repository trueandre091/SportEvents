import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainLanding.css';

function Profile() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navItems = [
        { title: "профиль", path: "/profile" },
        { title: "регионы", path: "/regions" },
        { title: "события", path: "/events" },
        { title: "контакты", path: "/contacts" },
        { title: "антидопинг", path: "/antidoping" }
    ];

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить данные профиля');
            }

            const data = await response.json();
            setProfileData(data);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка при загрузке профиля:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigation = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    if (isLoading) {
        return (
            <div className="profile-content">
                <div className="loading">Загрузка профиля...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-content">
                <div className="error">
                    <p>{error}</p>
                    <button 
                        className="action-button primary"
                        onClick={fetchProfileData}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-content">
            {/* Кнопка меню */}
            <button 
                className="profile-menu"
                onClick={toggleMobileMenu}
            >
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="menu-text">меню</span>
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

            {profileData && (
                <div className="profile-card">
                    <div className="profile-header"></div>
                    <div className="profile-body">
                        <div className="profile-photo">
                            фото
                        </div>

                        <div className="profile-info">
                            <div className="info-field">
                                <label>ФИО:</label>
                                <div className="info-value">{profileData.name}</div>
                            </div>

                            {profileData.region && (
                                <div className="info-field">
                                    <label>регион:</label>
                                    <div className="info-value">{profileData.region}</div>
                                </div>
                            )}

                            <div className="info-field">
                                <label>email:</label>
                                <div className="info-value">{profileData.email}</div>
                            </div>

                            <div className="info-field">
                                <label>Telegram ID:</label>
                                <div className="info-value">{profileData.tg_id}</div>
                            </div>

                            <div className="info-field">
                                <label>Имя пользователя:</label>
                                <div className="info-value">{profileData.username}</div>
                            </div>

                            <div className="profile-actions">
                                <button className="action-button primary">
                                    ваши мероприятия
                                </button>
                                <button className="action-button secondary">
                                    изменить данные
                                </button>
                                <button 
                                    className="action-button secondary"
                                    onClick={() => handleNavigation('/')}
                                >
                                    на главную
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile; 