import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const colors = {
    darkGray: '#1a1a1a',
    white: '#ffffff',
    orange: '#f79423',
    blue: '#5046e1'
  };
  const navigate = useNavigate();
  const [squares, setSquares] = useState([]);

  const createSquares = () => {
    const container = document.querySelector('.date-grid');
    if (!container) return;
    
    const squareSize = 80;
    const gap = 10;
    const containerWidth = container.offsetWidth;
    
    const columns = Math.floor((containerWidth + gap) / (squareSize + gap));
    
    const today = new Date();
    const newSquares = [];
    
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        
        const canBeDouble = col < columns - 1;
        const isDouble = canBeDouble && Math.random() < 0.3;
        
        newSquares.push({
          date,
          isDouble,
          color: Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)]
        });
        
        if (isDouble) {
          col++;
        }
      }
    }
    
    setSquares(newSquares);
  };

  useEffect(() => {
    createSquares();
    
    const handleResize = debounce(createSquares, 400);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

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

  return (
    <header className="header">
      <h1>КАЛЕНДАРЬ СОБЫТИЙ</h1>
      <div className="date-grid">
        {squares.map((square, index) => (
          <div
            key={index}
            className={`date-box ${square.isDouble ? 'double-square' : ''}`}
            style={{
              backgroundColor: square.color,
              color: square.color === colors.darkGray || square.color === colors.blue ? 
                     colors.white : colors.darkGray
            }}
          >
            {formatDate(square.date)}
          </div>
        ))}
      </div>
      <div className="filter-button-container">
        <button 
          className="filter-button"
          onClick={() => navigate('/events')}
        >
          Фильтр спортивных событий
        </button>
      </div>
    </header>
  );
}

export default Header; 