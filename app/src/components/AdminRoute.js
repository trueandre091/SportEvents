import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userData } = useAuth();

  // Проверяем роли администратора
  const isAdmin = userData?.role === 'ADMIN' || 
                 userData?.role === 'REGIONAL_ADMIN' || 
                 userData?.role === 'CENTRAL_ADMIN';

  if (!isAuthenticated || !isAdmin) {
    console.log('Доступ запрещен: ', {
      isAuthenticated,
      userRole: userData?.role,
      isAdmin
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 