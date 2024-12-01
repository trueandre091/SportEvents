import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import './EventSlider.css';

// Кастомизируем слайдер
const CustomSlider = styled(Slider)({
  color: '#007bff',
  height: 2,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 12,
    width: 12,
    backgroundColor: '#007bff',
    border: '2px solid white',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(0, 123, 255, 0.16)',
    },
    '&:focus, &:active': {
      boxShadow: '0 0 0 12px rgba(0, 123, 255, 0.16)',
    },
  },
  '& .MuiSlider-track': {
    height: 2,
  },
  '& .MuiSlider-rail': {
    height: 2,
    opacity: 0.2,
    backgroundColor: '#fff',
  },
});

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
        console.log('Received events data:', data);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching random events:', error);
      }
    };

    fetchRandomEvents();
  }, []);

  const formatDateRange = (start, end) => {
    try {
      console.log('Formatting dates:', { start, end });
      
      if (!start || !end) {
        return 'Дата не указана';
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      
      console.log('Parsed dates:', { startDate, endDate });
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Дата не указана';
      }
      
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const month = startDate.toLocaleString('ru-RU', { month: 'long' });
      
      const result = `${startDay}-${endDay} ${month}`;
      console.log('Formatted result:', result);
      return result;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Дата не указана';
    }
  };

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`);
  };

  const handleSliderChange = (_, value) => {
    setCurrentIndex(value);
    if (sliderRef.current) {
      const scrollAmount = value * 260;
      sliderRef.current.scrollLeft = scrollAmount;
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="slider-wrapper">
      <div 
        className="slider-container"
        ref={sliderRef}
      >
        <div className="slider-track">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className={`slider-item ${index === currentIndex ? 'active' : ''}`}
            >
              <div className="event-date">
                {formatDateRange(event.date_start, event.date_end)}
              </div>
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
      <div className="slider-controls">
        <CustomSlider
          value={currentIndex}
          onChange={handleSliderChange}
          min={0}
          max={events.length - 1}
          step={1}
        />
      </div>
    </div>
  );
}

export default EventSlider; 