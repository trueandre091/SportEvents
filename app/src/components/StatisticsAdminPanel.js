import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './StatisticsAdminPanel.css';

const StatisticsAdminPanel = () => {
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
        return <div className="admin-statistics-loading">Загрузка...</div>;
    }

    if (!userData) {
        return null;
    }

    return (
        <div className="admin-statistics-panel">
            <div className="admin-statistics-header">
                <h1>Здравствуйте, {userData.name}!</h1>
            </div>
            
            <div className="admin-statistics-content">
                <h2>Статистика</h2>
                {/* Здесь будет контент статистики */}
            </div>
        </div>
    );
};

export default StatisticsAdminPanel; 