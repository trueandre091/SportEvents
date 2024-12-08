import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('archive', 'False');

        const response = await fetch('/api/fsp/events', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить события');
        }

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubscribe = async (eventId) => {
    try {
      const formData = new FormData();
      formData.append('id', eventId);

      const response = await fetch('/api/user/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': authService.getToken()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка при подписке на мероприятие');
      }

      console.log('Успешная подписка на мероприятие:', eventId);
    } catch (error) {
      console.error('Ошибка при подписке:', error);
      setError('Не удалось подписаться на мероприятие');
    }
  };

  const handleEventClick = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const filteredEvents = events.filter(event => {
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.place?.toLowerCase().includes(query) ||
      event.discipline?.toLowerCase().includes(query) ||
      event.region?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="events-container">
        <div className="events-card">
          <div>Загрузка событий...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="events-card">
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fsp-events-container">
      <div className="fsp-events-card">
        <div className="fsp-events-header">
          <h1 className="fsp-events-title">События</h1>
          <button className="fsp-events-filter-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            фильтры
          </button>
        </div>

        <div className="fsp-events-search-container">
          <input
            type="text"
            className="fsp-events-search-input"
            placeholder="Поиск по названию, месту, дисциплине или региону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="fsp-events-list">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="fsp-events-item"
              data-expanded={expandedEvent === event.id}
              onClick={() => handleEventClick(event.id)}
            >
              <div className="fsp-events-item-header">
                <h2 className="fsp-events-item-title">{event.title}</h2>
                <div className="fsp-events-item-meta">
                  <div className="fsp-events-item-date">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {new Date(event.date_start).toLocaleString('ru', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <button 
                    className="fsp-events-subscribe-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribe(event.id);
                    }}
                  >
                    подписаться
                  </button>
                </div>
              </div>
              
              <div className="fsp-events-item-content">
                <p>{event.description}</p>
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                  <div>Место проведения: {event.place}</div>
                  <div>Регион: {event.region}</div>
                  <div>Дисциплина: {event.discipline}</div>
                  <div>Представитель: {event.representative}</div>
                  <div>Количество участников: {event.participants_num}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button 
        className="back-to-main-button"
        onClick={() => navigate('/')}
      >
        На главную
      </button>
    </div>
  );
}

function EventItem({ event, onSubscribe }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className="event-item" 
      data-expanded={isExpanded}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="event-header">
        <h2 className="event-title">{event.title}</h2>
        <div className="event-meta">
          <div className="event-date">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {new Date(event.date_start).toLocaleString('ru', {
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <button 
            className="subscribe-button"
            onClick={(e) => {
              e.stopPropagation();
              onSubscribe(event.id);
            }}
          >
            подписаться
          </button>
        </div>
      </div>
      
      <div className="event-content">
        <p>{event.description}</p>
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <div>Место проведения: {event.place}</div>
          <div>Регион: {event.region}</div>
          <div>Дисциплина: {event.discipline}</div>
          <div>Представитель: {event.representative}</div>
          <div>Количество участников: {event.participants_num}</div>
        </div>
      </div>
    </div>
  );
}

export default Events; 