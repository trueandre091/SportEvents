import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getTokenFromStorage, setTokenWithExpiry, removeToken } from '../utils/tokenUtils';
import { getProfile } from '../api/user';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Список защищенных маршрутов
const PROTECTED_ROUTES = ['/profile'];

// Список маршрутов только для администраторов
const ADMIN_ROUTES = [];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getTokenFromStorage());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shakeError, setShakeError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, является ли текущий маршрут защищенным
  const isProtectedRoute = PROTECTED_ROUTES.includes(location.pathname);

  // Загрузка данных пользователя при инициализации
  useEffect(() => {
    const loadUserData = async () => {
      console.log('Инициализация AuthContext');
      const token = getTokenFromStorage();
      
      if (token) {
        console.log('Найден токен, проверяем профиль');
        try {
          const response = await getProfile();
          console.log('Полный ответ от getProfile:', response);
          
          if (response.ok && response.user && response.user.email) {
            console.log('Профиль валиден, полученные данные:', {
              user: { ...response.user, password: '***' }
            });
            setUserData(response.user);
            setIsAuthenticated(true);
          } else {
            console.warn('Профиль невалиден или отсутствуют данные:', response);
            removeToken();
            setIsAuthenticated(false);
            setUserData(null);
            // Редирект только если мы на защищенном маршруте
            if (isProtectedRoute) {
              navigate('/', { replace: true });
            }
          }
        } catch (error) {
          console.error('Ошибка при загрузке профиля:', error);
          removeToken();
          setIsAuthenticated(false);
          setUserData(null);
          // Редирект только если мы на защищенном маршруте
          if (isProtectedRoute) {
            navigate('/', { replace: true });
          }
        }
      } else {
        console.log('Токен не найден, пользователь не аутентифицирован');
        // Редирект только если мы на защищенном маршруте
        if (isProtectedRoute) {
          navigate('/', { replace: true });
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, [navigate, location.pathname, isProtectedRoute]);

  const login = useCallback((token, user) => {
    console.log('Вход в систему:', {
      token: token ? token.substring(0, 20) + '...' : 'отсутствует',
      user: user ? { ...user, password: '***' } : 'отсутствует'
    });
    setTokenWithExpiry(token);
    setIsAuthenticated(true);
    setUserData(user);
  }, []);

  const logout = useCallback(() => {
    console.log('Выход из системы');
    setIsAuthenticated(false);
    setUserData(null);
    removeToken();
    navigate('/', { replace: true });
    window.location.reload();
  }, [navigate]);

  useEffect(() => {
    console.log('Изменение состояния аутентификации:', {
      isAuthenticated,
      userData: userData ? { ...userData, password: '***' } : null
    });
  }, [isAuthenticated, userData]);

  if (loading) {
    console.log('AuthContext загружается...');
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
      setShakeError
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