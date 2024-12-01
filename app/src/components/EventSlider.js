import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSlider.css';

function EventSlider() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchRandomEvents = async () => {
      try {
        const response = await fetch('/api/events/random');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching random events:', error);
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
    if (currentIndex < events.length - 1) {
      setCurrentIndex(currentIndex + 1);
      sliderRef.current.scrollLeft += 260; // Прокручиваем на ширину одного слайда
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      sliderRef.current.scrollLeft -= 260; // Прокручиваем на ширину одного слайда
    }
  };

  if (events.length === 0) return null;

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