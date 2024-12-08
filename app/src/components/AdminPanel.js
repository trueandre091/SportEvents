// app/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './AdminPanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    navigate('/');
                    return;
                }

                const data = await authService.getProfile();
                setUserData(data);

                if (data.role !== 'CENTRAL_ADMIN' && 
                    data.role !== 'REGIONAL_ADMIN' && 
                    data.role !== 'ADMIN') {
                    navigate('/');
                    return;
                }
            } catch (error) {
                console.error('Ошибка при получении данных профиля:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) {
        return <div className="admin-loading">Загрузка...</div>;
    }

    if (!userData) {
        return null;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Здравствуйте, {userData.name}!</h1>
                <button 
                    className="admin-home-button"
                    onClick={() => navigate('/')}
                >
                    На главную
                </button>
            </div>
            
            <div className="admin-menu">
                {userData.role === 'CENTRAL_ADMIN' && (
                    <button 
                        className="admin-button"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/profile/admin/representatives');
                        }}
                    >
                        <div className="admin-button-content">
                            <span className="admin-button-icon">👥</span>
                            <span className="admin-button-text">Региональные представители ФСП</span>
                        </div>
                    </button>
                )}
                
                <button 
                    className="admin-button"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/profile/admin/events');
                    }}
                >
                    <div className="admin-button-content">
                        <span className="admin-button-icon">📅</span>
                        <span className="admin-button-text">События</span>
                    </div>
                </button>
                
                <button 
                    className="admin-button"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/profile/admin/statistics');
                    }}
                >
                    <div className="admin-button-content">
                        <span className="admin-button-icon">📊</span>
                        <span className="admin-button-text">Статистика</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;