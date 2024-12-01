import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import Loader from './Loader';
import './EventList.css';

function EventList() {
  const navigate = useNavigate();
  const { events, sports, setEvents, setSports } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    sport: searchParams.get('sport') || '',
    dateStart: searchParams.get('dateStart') || '',
    dateEnd: searchParams.get('dateEnd') || ''
  });
  const ITEMS_PER_PAGE = 30;
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Загрузка событий при монтировании компонента
  useEffect(() => {
    fetchFilteredEvents(filters);
  }, []); // Пустой массив зависимостей для загрзки только при монтировании

  const fetchFilteredEvents = async (filters) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем, есть ли заполненные фильтры
      const hasFilters = filters.sport || filters.dateStart || filters.dateEnd;

      // Если фильтры пустые, загружаем все события
      const url = hasFilters 
        ? `/api/events?${new URLSearchParams({
            sport: filters.sport || '',
            date_start: filters.dateStart || '',
            date_end: filters.dateEnd || ''
          })}`
        : '/api/events';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      
      // Получаем массив событий из ответа
      const eventsArray = data.events || [];
      setEvents(eventsArray);
      
      // Показываем первые 30 событий
      setDisplayedEvents(eventsArray.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(0);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const start = nextPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    setDisplayedEvents(prev => [...prev, ...events.slice(start, end)]);
    setCurrentPage(nextPage);
  };

  // Проверяем, есть ли еще события для загрузки
  const hasMore = displayedEvents.length < events.length;

  // Загрузка списка видов спорта при монтировании
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('/api/events/sports');
        if (!response.ok) throw new Error('Failed to fetch sports');
        const data = await response.json();
        setSports(data);
      } catch (err) {
        console.error('Error fetching sports:', err);
      }
    };

    fetchSports();
  }, [setSports]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    // Обновляем URL только если есть заполненные фильтры
    if (filters.sport || filters.dateStart || filters.dateEnd) {
      setSearchParams({
        sport: filters.sport,
        dateStart: filters.dateStart,
        dateEnd: filters.dateEnd
      });
    } else {
      // Если фильтры пустые, очищаем URL
      setSearchParams({});
    }
    // Загружаем события
    await fetchFilteredEvents(filters);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Дата не указана';
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString('ru-RU', { month: 'long' })}`;
  };

  const handleEventClick = (eventId) => {
    // Если кликнули на уже открытое событие - закрываем его
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      // Иначе открываем новое событие
      setExpandedEventId(eventId);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="events-container">
      <div className="header-controls">
        <button className="home-button" onClick={handleHomeClick}>
          На главную
        </button>
      </div>

      <form className="filters-form" onSubmit={handleApplyFilters}>
        <div className="filters-group">
          <select 
            name="sport" 
            value={filters.sport}
            onChange={handleFilterChange}
          >
            <option value="">Все виды спорта</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>

          <input
            type="date"
            name="dateStart"
            value={filters.dateStart}
            onChange={handleFilterChange}
            placeholder="Дата начала"
          />
          
          <input
            type="date"
            name="dateEnd"
            value={filters.dateEnd}
            onChange={handleFilterChange}
            placeholder="Дата окончания"
          />
          
          <button type="submit" className="apply-button">
            Применить
          </button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="error">Ошибка: {error}</div>
      ) : (
        <div className="list-events">
          {displayedEvents.map(event => (
            <div 
              key={event.id} 
              className={`list-row ${expandedEventId === event.id ? 'expanded' : ''}`}
            >
              <div 
                className="list-row-header" 
                onClick={() => handleEventClick(event.id)}
              >
                <div className="list-date">
                  {formatDateRange(event.date_start, event.date_end)}
                </div>
                <div className="list-title">{event.title}</div>
                <div className="list-sport">{event.sport}</div>
                <div className="list-place">{event.place}</div>
              </div>
              <div className="event-details">
                <div className="event-details-content">
                  {event.discipline && (
                    <div className="detail-item">
                      <span className="detail-label">Дисциплина:</span>
                      <span>{event.discipline}</span>
                    </div>
                  )}
                  {event.participants && (
                    <div className="detail-item">
                      <div className="participants-info">
                        <span className="detail-label">Участники:</span>
                        <span>{event.participants}</span>
                        {event.participants_num && (
                          <span className="participants-count">
                            Количество участников: {event.participants_num}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && !error && (
        <div className="load-more">
          <button onClick={handleLoadMore}>
            Загрузить больше событий
          </button>
        </div>
      )}
    </div>
  );
}

export default EventList; 