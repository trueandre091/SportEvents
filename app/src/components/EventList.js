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

      // Форматируем даты в нужный формат YYYY-MM-DD
      const formattedDateStart = filters.dateStart ? new Date(filters.dateStart).toISOString().split('T')[0] : '';
      const formattedDateEnd = filters.dateEnd ? new Date(filters.dateEnd).toISOString().split('T')[0] : '';

      // Если фильтры не заполнены, делаем запрос без параметров
      const url = hasFilters 
        ? `/api/events?${new URLSearchParams({
            ...(filters.sport && { sport: filters.sport }),
            ...(filters.dateStart && { date_start: formattedDateStart }),
            ...(filters.dateEnd && { date_end: formattedDateEnd })
          })}`
        : '/api/events';

      console.log('Fetching URL with dates:', url); // Для отладки

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('Received filtered data:', data); // Для отладки

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
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);

    // Обновляем URL
    if (newFilters.sport || newFilters.dateStart || newFilters.dateEnd) {
      setSearchParams(newFilters);
    } else {
      setSearchParams({});
    }

    // Сразу применяем фильтры
    fetchFilteredEvents(newFilters);
  }, [filters, setSearchParams, fetchFilteredEvents]);

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
    
    // Проверяем, совпадают ли месяц и год
    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    
    if (sameMonth && sameYear) {
      // Если месяц и год совпадают, показываем их один раз
      return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString('ru-RU', { month: 'long' })} ${startDate.getFullYear()}`;
    } else if (sameYear) {
      // Если совпадает только год, показываем его один раз
      return `${startDate.getDate()} ${startDate.toLocaleString('ru-RU', { month: 'long' })} - ${endDate.getDate()} ${endDate.toLocaleString('ru-RU', { month: 'long' })} ${startDate.getFullYear()}`;
    } else {
      // Если не совпадает ничего, показываем полные даты
      return `${startDate.getDate()} ${startDate.toLocaleString('ru-RU', { month: 'long' })} ${startDate.getFullYear()} - ${endDate.getDate()} ${endDate.toLocaleString('ru-RU', { month: 'long' })} ${endDate.getFullYear()}`;
    }
  };

  const handleEventClick = (eventId) => {
    console.log('Clicked event:', eventId);
    console.log('Current expanded:', expandedEventId);
    console.log('Event object:', events.find(e => e.event_id === eventId));
    
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
      <form className="filters-form">
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
          
        </div>
      </form>

      <h2 className="list-title-main">Список событий</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="error">Ошибка: {error}</div>
      ) : (
        <div className="list-events">
          {displayedEvents.map(event => (
            <div 
              key={event.event_id} 
              className={`list-row ${expandedEventId === event.event_id ? 'expanded' : ''}`}
            >
              <div 
                className="list-row-header" 
                onClick={() => handleEventClick(event.event_id)}
              >
                <div className="list-date">
                  {formatDateRange(event.date_start, event.date_end)}
                </div>
                <div className="list-title">{event.title}</div>
                <div className="list-sport">{event.sport}</div>
                <div className="list-place">{event.place}</div>
              </div>
              <div className="list-details">
                <div className="list-details-content">
                  {event.discipline && (
                    <div className="detail-item discipline">
                      <span className="detail-label">Дисциплина</span>
                      <span className="detail-value">{event.discipline}</span>
                    </div>
                  )}
                  {(event.participants || event.participants_num) && (
                    <div className="detail-item participants">
                      <span className="detail-label">Участники</span>
                      <div className="participants-container">
                        {event.participants && (
                          <span className="detail-value">{event.participants}</span>
                        )}
                        {event.participants_num && (
                          <span className="participants-count">
                            Количество: {event.participants_num}
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