import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROUTE_ACCESS = {
  '/admin/regions': ['ADMIN', 'CENTRAL_ADMIN'],
  '/admin/events': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN'],
  '/admin/stats': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN'],
  '/admin': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN']
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userData } = useAuth();
  const location = useLocation();

  // Проверяем роли администратора
  const isAdmin = userData?.role === 'ADMIN' || 
                 userData?.role === 'REGIONAL_ADMIN' || 
                 userData?.role === 'CENTRAL_ADMIN';

  // Проверяем доступ к конкретному маршруту
  const hasRouteAccess = () => {
    const currentPath = location.pathname;
    const allowedRoles = ROUTE_ACCESS[currentPath];
    
    if (!allowedRoles) return true; // Если маршрут не определен в ROUTE_ACCESS, разрешаем доступ
    return allowedRoles.includes(userData?.role);
  };

  if (!isAuthenticated || !isAdmin || !hasRouteAccess()) {
    console.log('Доступ запрещен: ', {
      isAuthenticated,
      userRole: userData?.role,
      isAdmin,
      path: location.pathname,
      hasAccess: hasRouteAccess()
    });
    // Если пользователь авторизован как админ, но нет доступа к конкретному маршруту,
    // перенаправляем на админ панель, иначе на главную
    if (isAuthenticated && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 