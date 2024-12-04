import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import Logout from './auth/Logout';
import './Header.css';

function Header() {
  const colors = {
    darkGray: '#1a1a1a',
    white: '#ffffff',
    orange: '#f79423',
    blue: '#5046e1'
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [squares, setSquares] = useState([]);
  const [dates, setDates] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const createSquares = () => {
    const container = document.querySelector('.date-grid');
    if (!container) return;
    
    const squareSize = 80;
    const gap = 10;
    const containerWidth = container.offsetWidth;
    
    const columns = Math.floor((containerWidth + gap) / (squareSize + gap));
    const newSquares = [];
    
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        
        const canBeDouble = col < columns - 1;
        const isDouble = canBeDouble && Math.random() < 0.3;
        
        newSquares.push({
          isDouble,
          color: Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)]
        });
        
        if (isDouble) {
          col++;
        }
      }
    }
    
    setSquares(newSquares);
    addDatesToSquares(newSquares);
  };

  const addDatesToSquares = (squares) => {
    const today = new Date();
    const newDates = squares.map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
    setDates(newDates);
  };

  const formatDate = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  useEffect(() => {
    createSquares();
    
    const handleResize = debounce(createSquares, 400);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleButtonClick = () => {
    if (location.pathname === '/events') {
      navigate('/');
    } else {
      navigate('/events');
    }
  };

  const handleSquareClick = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Форматируем дату в YYYY-MM-DD
    navigate(`/events?selected_date=${formattedDate}`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogoutSuccess = () => {
    setIsAuthenticated(false);
  };

  return (
    <header className="header">
      <div className="auth-buttons">
        {!isAuthenticated ? (
          <>
            <button 
              className="auth-button" 
              onClick={handleLoginClick}
            >
              Войти
            </button>
            <button 
              className="auth-button" 
              onClick={handleRegisterClick}
            >
              Регистрация
            </button>
          </>
        ) : (
          <Logout onLogout={handleLogoutSuccess} />
        )}
      </div>
      <h1>КАЛЕНДАРЬ СОБЫТИЙ</h1>
      <div className="date-grid">
        {squares.map((square, index) => (
          <div
            key={index}
            className={`date-box ${square.isDouble ? 'double-square' : ''}`}
            style={{
              backgroundColor: square.color,
              color: square.color === colors.darkGray || square.color === colors.blue ? 
                     colors.white : colors.darkGray,
              cursor: 'pointer' // Добавляем курсор-указатель
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
          {location.pathname === '/events' ? 'На главную' : 'Фильтр спортивных событий'}
        </button>
      </div>
    </header>
  );
}

export default Header; 