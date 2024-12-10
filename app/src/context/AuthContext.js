import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getTokenFromStorage, removeToken } from '../utils/tokenUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getTokenFromStorage());
  const [userData, setUserData] = useState(null);

  const login = useCallback((token, user) => {
    setIsAuthenticated(true);
    setUserData(user);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserData(null);
    removeToken();
    window.location.href = '/';
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Пользователь вышел из системы');
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userData,
      login,
      logout,
      setUserData 
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