import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedFields, setEditedFields] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    navigate('/');
                    return;
                }

                const data = await authService.getProfile();
                setUserData(data);
            } catch (error) {
                console.error('Ошибка при получении данных профиля:', error);
                setError(error.message);
                
                if (error.message.toLowerCase().includes('token') || 
                    error.message.toLowerCase().includes('unauthorized') || 
                    error.message.includes('401')) {
                    authService.removeToken();
                    authService.removeUser();
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedFields({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (value !== userData[name]) {
            setEditedFields(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            const newEditedFields = { ...editedFields };
            delete newEditedFields[name];
            setEditedFields(newEditedFields);
        }
    };

    const handleSave = async () => {
        const originalData = { ...userData };
        try {
            setLoading(true);
            const updateData = {
                ...userData,
                ...editedFields,
                notifications: userData.notifications || []
            };

            const updatedUser = await authService.updateProfile(updateData);
            setUserData(updatedUser);
            setEditedFields({});
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setError('Не удалось обновить данные профиля');
            setUserData(originalData);
            setEditedFields({});
            setIsEditing(false);
        } finally {
            setLoading(false);
        }
    };

    const renderField = (label, field, placeholder) => {
        return (
            <div className="profile-field">
                <label>{label}</label>
                {isEditing ? (
                    <input
                        type="text"
                        name={field}
                        value={editedFields[field] !== undefined ? editedFields[field] : userData[field] || ''}
                        onChange={handleInputChange}
                        className="profile-field-value editable"
                        placeholder={placeholder}
                    />
                ) : (
                    <div className="profile-field-value">
                        {userData[field] || 'Не указано'}
                    </div>
                )}
            </div>
        );
    };

    const renderProfileHeader = () => {
        switch (userData.role) {
            case 'REGIONAL_ADMIN':
                return 'Региональный представитель ФСП';
            case 'CENTRAL_ADMIN':
                return 'Центральный представитель ФСП';
            default:
                return 'Личный кабинет';
        }
    };

    const renderProfileFields = () => {
        const commonFields = [
            { label: 'ФИО:', field: 'name', placeholder: 'Введите ФИО' },
            { label: 'email:', field: 'email', placeholder: 'Введите email' },
            { label: 'Telegram ID:', field: 'tg_id', placeholder: 'Введите Telegram ID' },
            { label: 'Имя пользователя:', field: 'username', placeholder: 'Введите имя пользователя' }
        ];

        if (userData.role === 'REGIONAL_ADMIN' || userData.role === 'CENTRAL_ADMIN') {
            commonFields.splice(1, 0, { label: 'регион:', field: 'region', placeholder: 'Введите регион' });
        }

        return commonFields.map(field => renderField(field.label, field.field, field.placeholder));
    };

    const renderProfileActions = () => {
        const actions = [];

        if (userData.role === 'REGIONAL_ADMIN') { // TODO: Раскомментировать после тестирования
            actions.push(
                <button className="profile-button primary" onClick={() => navigate('/events/my')}>
                    ваши мероприятия
                </button>
            );
        }

        if (userData.role === 'USER' || userData.role === 'CENTRAL_ADMIN') {
            actions.push(
                <button className="profile-button primary" onClick={() => navigate('/profile/admin')}>
                    перейти в admin-панель
                </button>
            );
        }

        actions.push(
            isEditing ? (
                <button 
                    className="profile-button primary" 
                    onClick={handleSave}
                    disabled={Object.keys(editedFields).length === 0}
                >
                    сохранить данные
                </button>
            ) : (
                <button className="profile-button primary" onClick={handleEdit}>
                    изменить данные
                </button>
            )
        );

        actions.push(
            <button className="profile-button danger" onClick={() => navigate('/')}>
                на главную
            </button>
        );

        return actions;
    };

    if (loading) {
        return <div className="loading-text">Загрузка...</div>;
    }

    if (error) {
        return <div className="error-text">{error}</div>;
    }

    if (!userData) {
        return null;
    }

    return (
        <div className="profile-page">
            <button className="menu-button" onClick={() => navigate('/')}>
                Меню
            </button>
            
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        {renderProfileHeader()}
                    </div>
                    
                    <div className="profile-content">
                        <div className="profile-photo">
                            фото
                        </div>

                        {renderProfileFields()}

                        <div className="profile-actions">
                            {renderProfileActions()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 