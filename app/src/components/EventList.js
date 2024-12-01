import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import Loader from './Loader';
import './EventList.css';

function EventList() {
  const navigate = useNavigate();
  const { events, sports, setEvents, setSports } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [filters, setFilters] = useState({
    sport: searchParams.get('sport') || '',
    dateStart: searchParams.get('dateStart') || '',
    dateEnd: searchParams.get('dateEnd') || ''
  });
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // Мемоизируем функцию форматирования даты
  const formatDate = useCallback((dateString) => {
    console.log('Formatting date:', dateString);
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      console.log('Parsed date:', date);
      if (isNaN(date.getTime())) return '';
      
      const formatted = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }, []);

  // Инициализация данных
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        try {
          setIsInitialLoading(true);
          await Promise.all([
            fetch('/api/events').then(res => res.json()).then(data => setEvents(data)),
            fetch('/api/events/sports').then(res => res.json()).then(data => setSports(data))
          ]);
          setIsInitialized(true);
        } finally {
          setTimeout(() => setIsInitialLoading(false), 1000);
        }
      }
    };

    initializeData();
  }, [isInitialized, setEvents, setSports]);

  // Фильтрация событий при изменении фильтров или событий
  useEffect(() => {
    if (!events.length) return;
    
    const filtered = events.filter(event => {
      const matchesSport = !filters.sport || event.sport === filters.sport;
      const matchesStartDate = !filters.dateStart || event.date_start >= filters.dateStart;
      const matchesEndDate = !filters.dateEnd || event.date_end <= filters.dateEnd;
      return matchesSport && matchesStartDate && matchesEndDate;
    });

    setFilteredEvents(filtered.slice(0, page * ITEMS_PER_PAGE));
    setHasMore(filtered.length > page * ITEMS_PER_PAGE);
  }, [filters, events, page]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleHomeClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const applyFilters = useCallback((e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      sport: filters.sport,
      dateStart: filters.dateStart,
      dateEnd: filters.dateEnd
    });
    setSearchParams(queryParams);
  }, [filters, setSearchParams]);

  // Мемоизируем список видов спорта
  const sportOptions = useMemo(() => (
    sports.map(sport => (
      <option key={sport} value={sport}>{sport}</option>
    ))
  ), [sports]);

  const toggleEventDetails = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="events-container">
      <form className="filters-form">
        <div className="filters-top">
          <select 
            name="sport" 
            value={filters.sport}
            onChange={handleFilterChange}
          >
            <option value="">Все виды спорта</option>
            {sportOptions}
          </select>
        </div>
        
        <div className="filters-bottom">
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
          
          <div className="filters-buttons">
            <button type="submit" className="apply-button" onClick={applyFilters}>
              Применить фильтры
            </button>
            <button type="button" className="home-button" onClick={handleHomeClick}>
              На главную
            </button>
          </div>
        </div>
      </form>

      <div className="events-list">
        {isInitialLoading ? (
          <Loader />
        ) : filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className={`event-row ${expandedEventId === event.id ? 'expanded' : ''}`}
              >
                <div 
                  className="event-row-header"
                  onClick={() => toggleEventDetails(event.id)}
                >
                  <div className="event-date">
                    {formatDate(event.date_start)}
                  </div>
                  <div className="event-title">{event.title}</div>
                  <div className="event-sport">{event.sport}</div>
                  <div className="event-place">{event.place}</div>
                </div>
                <div className="event-details">
                  <div className="event-details-content">
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                      <span>
                        {formatDate(event.date_start)}
                        {event.date_start && event.date_end && ' — '}
                        {formatDate(event.date_end)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>{event.place}</span>
                    </div>
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
                      </svg>
                      <span>{event.discipline || 'Дисциплина не указана'}</span>
                    </div>
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <div className="participants-info">
                        <span>{event.participants || 'Участники не указаны'}</span>
                        {event.participants_num && (
                          <span className="participants-count">
                            Количество участников: {event.participants_num}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="load-more">
                <button onClick={loadMore}>
                  Загрузить еще события
                </button>
              </div>
            )}
          </>
        ) : (
          <p>Нет событий для отображения</p>
        )}
      </div>
    </div>
  );
}

export default EventList; 