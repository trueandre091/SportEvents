import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTestControls, setShowTestControls] = useState(false);
    const navigate = useNavigate();

    // Тестовые данные вынесем за пределы useEffect
    const testProfiles = {
        regional_admin: {
            role: 'regional_admin',
            name: 'Иванов Иван Иванович',
            username: 'ivanov_admin',
            email: 'ivanov@fsp.ru',
            tg_id: '@ivanov_fsp',
            region: 'Московская область'
        },
        central_admin: {
            role: 'central_admin',
            name: 'Петров Петр Петрович',
            username: 'petrov_central',
            email: 'petrov@fsp.ru',
            tg_id: '@petrov_fsp'
        },
        user: {
            role: 'user',
            name: 'Сидоров Сидор Сидорович',
            username: 'sidorov_user',
            email: 'sidorov@mail.ru',
            tg_id: '@sidorov',
            subscriptions: [
                { event_name: 'Чемпионат России по самбо 2024' },
                { event_name: 'Кубок России по самбо 2024' },
                { event_name: 'Первенство России по самбо 2024' }
            ]
        },
        admin: {
            role: 'admin',
            name: 'Администратор Системы',
            username: 'system_admin',
            email: 'admin@fsp.ru'
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await authService.getProfile();
                console.log('Полученные данные профиля:', data);
                setProfile(data);
            } catch (error) {
                console.error('Ошибка при загрузке профиля:', error);
                // Проверяем все возможные варианты ошибки 404
                if (error.message === 'Unauthorized') {
                    setError('Необходима авторизация');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (
                    error.message === 'Not Found' || 
                    error.response?.status === 404 || 
                    error.message.includes('404') ||
                    error.message.includes('failed to fetch')
                ) {
                    console.log('Используем тестовые данные из-за ошибки получения данных');
                    // При ошибке используем тестовые данные
                    setProfile(testProfiles.user);
                    setError(null);
                } else {
                    setError('Не удалось загрузить данные профиля');
                    // Используем тестовые данные при любой ошибке
                    setProfile(testProfiles.user);
                    setError(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const switchToTestProfile = (profileKey) => {
        setProfile(testProfiles[profileKey]);
        setError(null);
    };

    const renderTestControls = () => (
        <div className="test-controls">
            <button 
                className="test-control-toggle"
                onClick={() => setShowTestControls(!showTestControls)}
            >
                {showTestControls ? 'Скрыть панель тестирования' : 'Показать панель тестирования'}
            </button>
            
            {showTestControls && (
                <div className="test-buttons">
                    <button 
                        className="test-button"
                        onClick={() => switchToTestProfile('regional_admin')}
                    >
                        Региональный админ
                    </button>
                    <button 
                        className="test-button"
                        onClick={() => switchToTestProfile('central_admin')}
                    >
                        Центральный админ
                    </button>
                    <button 
                        className="test-button"
                        onClick={() => switchToTestProfile('user')}
                    >
                        Пользователь
                    </button>
                    <button 
                        className="test-button"
                        onClick={() => switchToTestProfile('admin')}
                    >
                        Админ системы
                    </button>
                </div>
            )}
        </div>
    );

    const renderRegionalAdmin = () => (
        <div className="profile-info">
            <h2 className="profile-title">Региональный представитель ФСП</h2>
            <div className="profile-section">
                <div className="profile-field">
                    <label>ФИО:</label>
                    <span>{profile.name}</span>
                </div>
                <div className="profile-field">
                    <label>Регион:</label>
                    <span>{profile.region}</span>
                </div>
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile.email}</span>
                </div>
                <div className="profile-field">
                    <label>Telegram ID:</label>
                    <span>{profile.tg_id}</span>
                </div>
                <div className="profile-field">
                    <label>Имя пользователя:</label>
                    <span>{profile.username}</span>
                </div>
            </div>
            <div className="profile-actions">
                <button 
                    className="profile-button"
                    onClick={() => navigate('/sportevents/admin')}
                >
                    Перейти в админ панель
                </button>
                <button 
                    className="profile-button secondary"
                    onClick={() => navigate('/profile/edit')}
                >
                    Изменить данные
                </button>
            </div>
        </div>
    );

    const renderCentralAdmin = () => (
        <div className="profile-info">
            <h2 className="profile-title">Представитель центрального ФСП</h2>
            <div className="profile-section">
                <div className="profile-field">
                    <label>ФИО:</label>
                    <span>{profile.name}</span>
                </div>
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile.email}</span>
                </div>
                <div className="profile-field">
                    <label>Telegram ID:</label>
                    <span>{profile.tg_id}</span>
                </div>
                <div className="profile-field">
                    <label>Имя пользователя:</label>
                    <span>{profile.username}</span>
                </div>
            </div>
            <div className="profile-actions">
                <button 
                    className="profile-button"
                    onClick={() => navigate('/sportevents/admin')}
                >
                    Перейти в админ панель
                </button>
                <button 
                    className="profile-button secondary"
                    onClick={() => navigate('/profile/edit')}
                >
                    Изменить данные
                </button>
            </div>
        </div>
    );

    const renderUser = () => (
        <div className="profile-info">
            <div className="profile-section">
                <h2>Профиль пользователя</h2>
                <div className="profile-field">
                    <label>ФИО:</label>
                    <span>{profile.name}</span>
                </div>
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile.email}</span>
                </div>
                <div className="profile-field">
                    <label>Telegram ID:</label>
                    <span>{profile.tg_id}</span>
                </div>
                <div className="profile-field">
                    <label>Имя пользователя:</label>
                    <span>{profile.username}</span>
                </div>
            </div>
            <div className="profile-section">
                <h2>Подписки на уведомления</h2>
                {profile.subscriptions && profile.subscriptions.length > 0 ? (
                    <div className="subscriptions-list">
                        {profile.subscriptions.map((sub, index) => (
                            <div key={index} className="subscription-item">
                                {sub.event_name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-subscriptions">Нет активных подписок на уведомления</p>
                )}
            </div>
        </div>
    );

    const renderAdmin = () => (
        <div className="profile-info">
            <h2 className="profile-title">Администратор системы</h2>
            <div className="profile-section">
                <div className="profile-field">
                    <label>ФИО:</label>
                    <span>{profile.name}</span>
                </div>
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile.email}</span>
                </div>
                <div className="profile-field">
                    <label>Имя пользователя:</label>
                    <span>{profile.username}</span>
                </div>
            </div>
            <div className="profile-actions">
                <button 
                    className="profile-button"
                    onClick={() => navigate('/sportevents/admin')}
                >
                    Перейти в админ панель
                </button>
            </div>
        </div>
    );

    const renderProfileContent = () => {
        switch (profile.role) {
            case 'regional_admin':
                return renderRegionalAdmin();
            case 'central_admin':
                return renderCentralAdmin();
            case 'admin':
                return renderAdmin();
            case 'user':
            default:
                return renderUser();
        }
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h1>Загрузка п��офиля...</h1>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h1>Ошибка</h1>
                    <p className="error-message">{error}</p>
                    <div className="profile-actions">
                        <button 
                            className="profile-button"
                            onClick={() => navigate('/')}
                        >
                            На главную
                        </button>
                        <button 
                            className="profile-button secondary"
                            onClick={() => window.location.reload()}
                        >
                            Повторить
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {renderTestControls()}
            <div className="profile-container">
                {profile && renderProfileContent()}
                <div className="profile-actions">
                    <button 
                        className="profile-button"
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile; 