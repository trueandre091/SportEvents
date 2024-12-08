import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const colors = useMemo(() => ({
    darkGray: '#1a1a1a',
    white: '#ffffff',
    orange: '#f79423',
    blue: '#5046e1'
  }), []);

  const navigate = useNavigate();
  const location = useLocation();
  const [squares, setSquares] = useState([]);
  const [dates, setDates] = useState([]);

  const addDatesToSquares = useCallback((squares) => {
    const today = new Date();
    const newDates = squares.map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
    setDates(newDates);
  }, []);

  const createSquares = useCallback(() => {
    const container = document.querySelector('.date-grid');
    if (!container) return;
    
    const squareSize = 80;
    const gap = 10;
    const containerWidth = container.offsetWidth;
    
    const columns = Math.floor((containerWidth + gap) / (squareSize + gap));
    const newSquares = [];
    
    // Используем seed для ��енерации случайных чисел
    const seed = Date.now();
    const random = (index) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };
    
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        
        const canBeDouble = col < columns - 1;
        const isDouble = canBeDouble && random(index) < 0.3;
        
        newSquares.push({
          isDouble,
          color: Object.values(colors)[Math.floor(random(index + 1) * Object.values(colors).length)]
        });
        
        if (isDouble) {
          col++;
        }
      }
    }
    
    setSquares(newSquares);
    addDatesToSquares(newSquares);
  }, [colors, addDatesToSquares]);

  const formatDate = useCallback((date) => {
    return date.getDate().toString().padStart(2, '0');
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    createSquares();
  }, []); // Запускаем только при монтировании

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = debounce(() => {
      createSquares();
    }, 400);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createSquares]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleButtonClick = useCallback(() => {
    if (location.pathname === '/sportevents/events') {
      navigate('/sportevents');
    } else {
      navigate('/sportevents/events');
    }
  }, [location.pathname, navigate]);

  const handleSquareClick = useCallback((date) => {
    const formattedDate = date.toISOString().split('T')[0];
    navigate(`/sportevents/events?selected_date=${formattedDate}`);
  }, [navigate]);

  return (
    <header className="header">
      <div className="header-top">
        <button 
          className="back-to-main"
          onClick={() => navigate('/')}
        >
          ← Вернуться на сайт ФСП
        </button>
      </div>
      <h1>КАЛЕНДАРЬ СОБЫТИЙ</h1>
      <div className="date-grid">
        {squares.map((square, index) => (
          <div
            key={`${index}-${square.color}`}
            className={`date-box ${square.isDouble ? 'double-square' : ''}`}
            style={{
              backgroundColor: square.color,
              color: square.color === colors.darkGray || square.color === colors.blue ? 
                     colors.white : colors.darkGray,
              cursor: 'pointer'
            }}
            onClick={() => dates[index] && handleSquareClick(dates[index])}
          >
            {dates[index] && formatDate(dates[index])}
          </div>
        ))}
      </div>
      <div className="filter-button-container">
        <button 
          className="filter-button"
          onClick={handleButtonClick}
        >
          {location.pathname === '/sportevents/events' ? 'На главную' : 'Фильтр спортивных событий'}
        </button>
      </div>
    </header>
  );
}

export default Header; 