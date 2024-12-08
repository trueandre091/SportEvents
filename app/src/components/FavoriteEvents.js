import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './FavoriteEvents.css';

export default function FavoriteEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/');
          return;
        }

        setIsLoading(true);
        const userData = await authService.getProfile();
        setEvents(userData.notifications || []);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setError('Не удалось загрузить избранные мероприятия');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUnsubscribe = async (eventId) => {
    try {
      const formData = new FormData();
      formData.append('id', eventId);

      const response = await fetch('/api/user/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': authService.getToken()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка при отписке от мероприятия');
      }

      // Обновляем список событий после успешной отписки
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Ошибка при отписке:', error);
      setError('Не удалось отписаться от мероприятия');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="favorite-events-page">
        <div className="favorite-events-container">
          <div className="loading-text">Загрузка мероприятий...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorite-events-page">
        <div className="favorite-events-container">
          <div className="error-text">{error}</div>
          <button 
            className="back-button"
            onClick={() => navigate('/profile')}
          >
            Вернуться в профиль
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-events-page">
      <div className="favorite-events-container">
        <h1 className="page-title">Избранные мероприятия</h1>
        
        {events.length === 0 ? (
          <div className="no-events">
            У вас пока нет избранных мероприятий
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h2 className="event-title">{event.title}</h2>
                  <span className="event-sport">{event.sport}</span>
                </div>

                <div className="event-info">
                  <div className="info-row">
                    <span className="info-label">Дисциплина:</span>
                    <span className="info-value">{event.discipline}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Регион:</span>
                    <span className="info-value">{event.region}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Место проведения:</span>
                    <span className="info-value">{event.place}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Даты проведения:</span>
                    <span className="info-value">
                      {formatDate(event.date_start)} - {formatDate(event.date_end)}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Участники:</span>
                    <span className="info-value">{event.participants}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Количество участников:</span>
                    <span className="info-value">{event.participants_num}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Представитель:</span>
                    <span className="info-value">{event.representative}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Статус:</span>
                    <span className="info-value">{event.status}</span>
                  </div>
                </div>

                {event.description && (
                  <div className="event-description">
                    <h3>Описание:</h3>
                    <p>{event.description}</p>
                  </div>
                )}

                {event.admin_description && (
                  <div className="event-admin-description">
                    <h3>Примечание администратора:</h3>
                    <p>{event.admin_description}</p>
                  </div>
                )}

                {event.files && event.files.length > 0 && (
                  <div className="event-files">
                    <h3>Прикрепленные файлы:</h3>
                    <ul>
                      {event.files.map((file, index) => (
                        <li key={index}>
                          <a href={file} target="_blank" rel="noopener noreferrer">
                            Файл {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button 
                  className="unsubscribe-button"
                  onClick={() => handleUnsubscribe(event.id)}
                >
                  Отписаться
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          className="back-button"
          onClick={() => navigate('/profile')}
        >
          Вернуться в профиль
        </button>
      </div>
    </div>
  );
} 