import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getTokenFromStorage, setTokenWithExpiry, removeToken } from '../utils/tokenUtils';
import { getProfile } from '../api/user';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Список защищенных маршрутов
const PROTECTED_ROUTES = ['/profile', '/admin', '/admin/stats', '/admin/events', '/admin/regions', '/admin/users'];

// Маршруты и роли, которые имеют к ним доступ
const ROUTE_ACCESS = {
  '/admin/regions': ['ADMIN', 'CENTRAL_ADMIN'],
  '/admin/events': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN'],
  '/admin/stats': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN'],
  '/admin': ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN']
};

// Роли, которые имеют доступ к админ панели
const ADMIN_ROLES = ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN'];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getTokenFromStorage());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeError, setShakeError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Мемоизированные значения
  const isProtectedRoute = useMemo(() => 
    PROTECTED_ROUTES.includes(location.pathname),
    [location.pathname]
  );
  
  const isAdminRoute = useMemo(() => 
    Object.keys(ROUTE_ACCESS).some(route => location.pathname.startsWith(route)),
    [location.pathname]
  );

  const hasAdminAccess = useMemo(() => 
    userData && ADMIN_ROLES.includes(userData.role),
    [userData]
  );

  const hasRouteAccess = useCallback(() => {
    if (!userData || !isAdminRoute) return false;

    const currentPath = Object.keys(ROUTE_ACCESS).find(route => 
      location.pathname.startsWith(route)
    );
    
    if (!currentPath) return true;
    return ROUTE_ACCESS[currentPath].includes(userData.role);
  }, [userData?.role, location.pathname, isAdminRoute]);

  // Загрузка профиля только при первом рендере
  useEffect(() => {
    const loadUserData = async () => {
      if (!isInitialLoad) return;
      
      const token = getTokenFromStorage();
      if (!token) {
        setIsAuthenticated(false);
        setUserData(null);
        setLoading(false);
        setIsInitialLoad(false);
        if (isProtectedRoute) {
          navigate('/', { replace: true });
        }
        return;
      }

      try {
        const response = await getProfile();
        if (response.ok && response.user && response.user.email) {
          setUserData(response.user);
          setIsAuthenticated(true);
        } else {
          removeToken();
          setIsAuthenticated(false);
          setUserData(null);
          if (isProtectedRoute) {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        removeToken();
        setIsAuthenticated(false);
        setUserData(null);
        if (isProtectedRoute) {
          navigate('/', { replace: true });
        }
      }
      
      setLoading(false);
      setIsInitialLoad(false);
    };

    loadUserData();
  }, [isInitialLoad, navigate, isProtectedRoute]);

  // Проверка доступа при изменении маршрута
  useEffect(() => {
    if (!isInitialLoad && isAuthenticated && isAdminRoute && userData) {
      const hasAccess = hasRouteAccess();
      if (!hasAccess) {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, userData?.role, isAdminRoute, isAuthenticated, isInitialLoad]);

  const login = useCallback((token, user) => {
    setTokenWithExpiry(token);
    setIsAuthenticated(true);
    setUserData(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Сначала уведомляем сервер о выходе
      console.log('Выход из системы');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    } finally {
      // Очищаем все локальные данные независимо от результата запроса
      setIsAuthenticated(false);
      setUserData(null);
      removeToken();
      // Очищаем все данные из localStorage
      localStorage.clear();
      // Перенаправляем на главную
      navigate('/', { replace: true });
      window.location.reload();
    }
  }, [navigate]);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userData,
      login,
      logout,
      setUserData,
      error,
      setError,
      shakeError,
      setShakeError,
      hasAdminAccess,
      hasRouteAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 