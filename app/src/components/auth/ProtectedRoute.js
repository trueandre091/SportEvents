import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    // Сохраняем путь, с которого пользователь был перенаправлен
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute; 