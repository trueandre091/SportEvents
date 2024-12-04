import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

function Logout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (onLogout) {
        onLogout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже если произошла ошибка при запросе к серверу,
      // мы все равно очищаем локальное состояние
      authService.removeToken();
      if (onLogout) {
        onLogout();
      }
      navigate('/login');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="logout-button"
    >
      Выйти
    </button>
  );
}

export default Logout; 