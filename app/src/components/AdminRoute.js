import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, hasAdminAccess, hasRouteAccess } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || (!hasAdminAccess && !hasRouteAccess())) {
    console.log('Доступ запрещен: ', {
      isAuthenticated,
      hasAdminAccess,
      hasRouteAccess: hasRouteAccess(),
      path: location.pathname
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 