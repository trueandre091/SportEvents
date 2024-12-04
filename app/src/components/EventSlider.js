import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSlider.css';

function EventSlider() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchRandomEvents = async () => {
      try {
        setError(null);
        const response = await fetch('/api/events/random', {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Неверный формат ответа от сервера');
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Не удалось загрузить события');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setEvents(data);
      } catch (error) {
        console.error('Error fetching random events:', error);
        if (error.name === 'AbortError') {
          setError('Превышено время ожидания ответа от сервера');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          setError('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        } else {
          setError(error.message || 'Сервер временно недоступен');
        }
      }
    };

    fetchRandomEvents();
  }, []);

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Дата не указана';
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return (
      <div className="event-date">
        <span className="event-date-numbers">
          {`${startDate.getDate()}-${endDate.getDate()}`}
        </span>
        <span className="event-date-month">
          {startDate.toLocaleString('ru-RU', { month: 'long' })}
        </span>
      </div>
    );
  };

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`);
  };

  const handleNext = () => {
    if (currentIndex < (events.length || 4) - 1) {
      setCurrentIndex(currentIndex + 1);
      const slideWidth = window.innerWidth <= 768 ? 160 : 260;
      if (sliderRef.current) {
        sliderRef.current.scrollLeft += slideWidth + 10;
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const slideWidth = window.innerWidth <= 768 ? 160 : 260;
      if (sliderRef.current) {
        sliderRef.current.scrollLeft -= slideWidth + 10;
      }
    }
  };

  const renderPlaceholder = () => {
    const placeholderSlides = [1, 2, 3, 4];
    
    const handlePlaceholderNext = () => {
      if (currentIndex < placeholderSlides.length - 1) {
        setCurrentIndex(currentIndex + 1);
        sliderRef.current.scrollLeft += 260;
      }
    };

    const handlePlaceholderPrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        sliderRef.current.scrollLeft -= 260;
      }
    };

    return (
      <div className="slider-wrapper">
        <h2 className="slider-title">Случайные события года</h2>
        <div className="slider-container" ref={sliderRef}>
          <div className="slider-track">
            {placeholderSlides.map((_, index) => (
              <div key={index} 
                className={`slider-item placeholder ${index === currentIndex ? 'active' : ''}`}
              >
                <div className="event-date">
                  <span className="event-date-numbers">--</span>
                  <span className="event-date-month">---</span>
                </div>
                <div className="event-title">Загрузка событий...</div>
                <div className="event-details">
                  <div className="event-type">Спорт</div>
                  <div className="event-place">Место проведения</div>
                </div>
                <button className="details-button" disabled>
                  подробнее
                </button>
              </div>
            ))}
          </div>
        </div>
        <button 
          className="slider-button left" 
          onClick={handlePlaceholderPrev}
          disabled={currentIndex === 0}
        />
        <button 
          className="slider-button right" 
          onClick={handlePlaceholderNext}
          disabled={currentIndex === placeholderSlides.length - 1}
        />
      </div>
    );
  };

  if (error || events.length === 0) {
    return (
      <div className="slider-wrapper">
        <h2 className="slider-title">Случайные события года</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="slider-container" ref={sliderRef}>
          <div className="slider-track">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} 
                className={`slider-item placeholder ${index === currentIndex ? 'active' : ''}`}
              >
                <div className="event-date">
                  <span className="event-date-numbers">--</span>
                  <span className="event-date-month">---</span>
                </div>
                <div className="event-title">
                  {error ? 'Не удалось загрузить события' : 'Загрузка событий...'}
                </div>
                <div className="event-details">
                  <div className="event-type">Спорт</div>
                  <div className="event-place">Место проведения</div>
                </div>
                <button className="details-button" disabled>
                  подробнее
                </button>
              </div>
            ))}
          </div>
        </div>
        <button 
          className="slider-button left" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        />
        <button 
          className="slider-button right" 
          onClick={handleNext}
          disabled={currentIndex === 3}
        />
      </div>
    );
  }

  return (
    <div className="slider-wrapper">
      <h2 className="slider-title">Случайные события года</h2>
      <div className="slider-container" ref={sliderRef}>
        <div className="slider-track">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className={`slider-item ${index === currentIndex ? 'active' : ''}`}
            >
              {formatDateRange(event.date_start, event.date_end)}
              <div className="event-title">{event.title}</div>
              <div className="event-details">
                <div className="event-type">{event.sport}</div>
                <div className="event-place">{event.place}</div>
              </div>
              <button 
                className="details-button"
                onClick={() => handleEventClick(event)}
              >
                подробнее
              </button>
            </div>
          ))}
        </div>
      </div>
      <button className="slider-button left" onClick={handlePrev} />
      <button className="slider-button right" onClick={handleNext} />
    </div>
  );
}

export default EventSlider; 