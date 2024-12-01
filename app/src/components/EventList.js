import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import Loader from './Loader';
import './EventList.css';

function EventList() {
  const navigate = useNavigate();
  const { events, setEvents, sports, setSports } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [filters, setFilters] = useState({
    sport: searchParams.get('sport') || '',
    dateStart: searchParams.get('dateStart') || '',
    dateEnd: searchParams.get('dateEnd') || ''
  });
  const ITEMS_PER_PAGE = 30;

  // Загрузка всех событий при первом рендере
  useEffect(() => {
    fetchFilteredEvents();
  }, []); 

  // Загрузка списка видов спорта
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

  const fetchFilteredEvents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем, есть ли заполненные фильтры
      const hasFilters = filters.sport || filters.dateStart || filters.dateEnd;

      // Если фильтры не заполнены, делаем запрос без параметров
      const url = hasFilters 
        ? `/api/events?${new URLSearchParams({
            ...(filters.sport && { sport: filters.sport }),
            ...(filters.dateStart && { date_start: filters.dateStart }),
            ...(filters.dateEnd && { date_end: filters.dateEnd })
          })}`
        : '/api/events';

      console.log('Fetching URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.events) {
        console.error('No events array in response:', data);
        setEvents([]);
        setDisplayedEvents([]);
        return;
      }

      setEvents(data.events);
      setDisplayedEvents(data.events.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(0);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
      setEvents([]);
      setDisplayedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []); // Убираем зависимость от filters

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    await fetchFilteredEvents(filters);
    
    // Обновляем URL только если есть фильтры
    if (filters.sport || filters.dateStart || filters.dateEnd) {
      setSearchParams(filters);
    } else {
      setSearchParams({});
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

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Дата не указана';
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString('ru-RU', { month: 'long' })}`;
  };

  const handleEventClick = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
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