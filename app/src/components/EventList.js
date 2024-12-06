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
    dateEnd: searchParams.get('dateEnd') || '',
    selected_date: searchParams.get('selected_date') || ''
  });
  const ITEMS_PER_PAGE = 30;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Добавляем новый useEffect для отслеживания изменений selected_date
  useEffect(() => {
    const selected_date = searchParams.get('selected_date');
    if (selected_date) {
      fetchEventsByDate(selected_date);
    }
  }, [searchParams]); // Зависимость от searchParams позволит отслеживать все изменения в URL

  // Изменяем первоначальный useEffect, убирая из него логику selected_date
  useEffect(() => {
    const selected_date = searchParams.get('selected_date');
    if (!selected_date) {
      // Загружаем все события только если нет selected_date
      fetchFilteredEvents();
    }
  }, []); 

  // Загрузка списка видов спорта
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('/api/events/sports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
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

      // Форматируем даты в нужный формат YYYY-MM-DD
      const formattedDateStart = filters.dateStart ? new Date(filters.dateStart).toISOString().split('T')[0] : '';
      const formattedDateEnd = filters.dateEnd ? new Date(filters.dateEnd).toISOString().split('T')[0] : '';

      // Создаем FormData для отправки
      const formData = new FormData();
      if (filters.sport) formData.append('sport', filters.sport);
      if (formattedDateStart) formData.append('date_start', formattedDateStart);
      if (formattedDateEnd) formData.append('date_end', formattedDateEnd);

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received filtered data:', data);


      setEvents(data);
      setDisplayedEvents(data.slice(0, ITEMS_PER_PAGE));
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

  const fetchEventsByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('Received events for date:', data);

      setEvents(data);
      setDisplayedEvents(data.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(0);
    } catch (err) {
      console.error('Error fetching events by date:', err);
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
      [name]: value,
      selected_date: '' // Сбрасываем selected_date пр�� изменении фильтров
    };
    setFilters(newFilters);

    // Удаляем selected_date из URL при изменении фильтров
    const searchParams = new URLSearchParams();
    if (newFilters.sport) searchParams.set('sport', newFilters.sport);
    if (newFilters.dateStart) searchParams.set('dateStart', newFilters.dateStart);
    if (newFilters.dateEnd) searchParams.set('dateEnd', newFilters.dateEnd);
    setSearchParams(searchParams);

    fetchFilteredEvents(newFilters);
  }, [filters, setSearchParams]);

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

  // Добавим функцию форматирования даты для заголовка
  const formatDateForTitle = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Функция поиска
  const filterEvents = useCallback((events, query) => {
    if (!query) {
      setFilteredEvents(events);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = events.filter(event => 
      event.title?.toLowerCase().includes(searchLower) ||
      event.sport?.toLowerCase().includes(searchLower) ||
      event.place?.toLowerCase().includes(searchLower) ||
      event.discipline?.toLowerCase().includes(searchLower)
    );
    setFilteredEvents(filtered);
  }, []);

  // Обновляем useEffect для обработки поиска при изменении событий
  useEffect(() => {
    filterEvents(events, searchQuery);
  }, [events, searchQuery, filterEvents]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="events-container">
      <form className="filters-form">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по названию, виду спорта, месту проведения или дисциплине..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
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

      <h2 className="list-title-main">
        {searchParams.get('selected_date') 
          ? `Список событий на ${formatDateForTitle(searchParams.get('selected_date'))}` 
          : 'Список событий'}
      </h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="error">Ошика: {error}</div>
      ) : (
        <div className="list-events">
          {filteredEvents.slice(0, (currentPage + 1) * ITEMS_PER_PAGE).map(event => (
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
                      <span className="detail-label">
                        <span className="icon">🎯</span>
                        Дисциплина
                      </span>
                      <span className="detail-value">{event.discipline}</span>
                    </div>
                  )}
                  {(event.participants || event.participants_num) && (
                    <div className="detail-item participants">
                      <span className="detail-label">
                        <span className="icon">👥</span>
                        Участники
                      </span>
                      <div className="participants-container">
                        {event.participants && (
                          <span className="detail-value">{event.participants}</span>
                        )}
                        {event.participants_num && (
                          <span className="participants-count">
                            <br />Количество: {event.participants_num}
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

      {filteredEvents.length > (currentPage + 1) * ITEMS_PER_PAGE && !loading && !error && (
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