/**
 * Хук для управления состоянием формы входа/регистрации
 * 
 * Состояния:
 * @state {boolean} isRegistering - Режим регистрации/входа
 * @state {string} email - Email пользователя
 * @state {string} password - Пароль
 * @state {string} confirmPassword - Подтверждение пароля (для регистрации)
 * @state {string} verificationCode - Код подтверждения (для регистрации)
 * @state {boolean} isCodeRequested - Флаг запроса кода подтверждения
 * @state {string} error - Текст ошибки
 * @state {boolean} shakeError - Флаг анимации ошибки
 * @state {boolean} isLoading - Флаг загрузки
 * @state {object} userData - Данные пользователя
 * @state {string} token - JWT токен
 * 
 * Методы:
 * - handleEmailChange - Обработка изменения email
 * - handlePasswordChange - Обработка изменения пароля
 * - handleConfirmPasswordChange - Обработка изменения подтверждения пароля
 * - handleVerificationCodeChange - Обработка изменения кода подтверждения
 * - handleSubmit - Обработка отправки формы
 * - handleVerificationCodeSubmit - Обработка отправки кода подтверждения
 * - toggleForm - Переключение между формами входа и регистрации
 * - handleLogout - Выход из системы
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, verifyToken, forgotPassword } from '../../api/auth';
import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../../utils/tokenUtils';
import { useAuth } from '../../context/AuthContext';


const useLoginRegistration = () => {  
  const { login: authLogin, userData } = useAuth();

  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isFormValid, setIsFormValid] = React.useState(false);
  const submitTimeoutRef = React.useRef(null);
  const [error, setError] = React.useState(null);
  const [shakeError, setShakeError] = React.useState(false);
  const [isCodeRequested, setIsCodeRequested] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [token, setToken] = React.useState(getTokenFromStorage());
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);

  React.useEffect(() => {
    const storedToken = getTokenFromStorage();
    if (storedToken) {
      setToken(storedToken);
      // Здесь можно добавить запрос на получение данных пользователя
    }
  }, []);

  const saveToken = React.useCallback((newToken) => {
    setTokenWithExpiry(newToken); // Сохраняем в localStorage на 7 дней
    setToken(newToken); // Обновляем состояние
  }, []);

  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    authLogin();
  };
  
  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);


  const validateForm = React.useCallback(async (newEmail = email, newPassword = password) => {
    // Сбрасываем предыдущий таймер
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    const allFieldsFilled = newEmail && newPassword;
    setIsFormValid(allFieldsFilled);

    // Если все поля заполнены и это форма входа
    if (allFieldsFilled && !isRegistering) {
      console.log('Поля заполнены, ждем 2 секунды перед отправкой');
      
      // Устанавливаем таймер на 2 секунды
      submitTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log('Отправляем запрос на вход');
          const response = await login(newEmail, newPassword);
          
          if (!response) {
            throw new Error('Нет ответа от сервера');
          }

          if (response.error) {
            setError(response.error);
            setShakeError(true);
            return;
          }

          if (response.token) {
            console.log('Успешный вход:', response);
            saveToken(response.token);
            authLogin(response.token, response.user);
            navigate('/events');
          } else {
            throw new Error('Отсутствует токен в ответе');
          }

        } catch (error) {
          console.error('Ошибка в процессе входа:', error);
          setError(error.message || 'Произошла ошибка при входе');
          setShakeError(true);
        } finally {
          setIsLoading(false);
          setTimeout(() => setShakeError(false), 500);
          submitTimeoutRef.current = null;
        }
      }, 2000); // Задержка в 2 секунды
    }
  }, [isRegistering, email, password, navigate, authLogin, login, saveToken]);

  // Хендлеры для обновления полей формы и проверки
  const handleEmailChange = async(e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    await validateForm(newEmail, password);
  };

  const handlePasswordChange = async(e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    await validateForm(email, newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleVerificationCodeChange = async(e) => {
    setVerificationCode(e.target.value);
  };

  // Функция для переключения между регистрацией и входом
  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
    setIsForgotPassword(false);
  };

  // Функция для проверки ответа на 401 ошибку
  const handleUnauthorized = React.useCallback((error) => {
    if (error.status === 401 || error.response?.status === 401) {
      console.log('Unauthorized error detected, removing token');
      removeToken();
      setToken(null);
      authLogin(null, null);
      navigate('/');
      return true;
    }
    return false;
  }, [navigate]);

  // Обновляем обработчики с проверкой на 401
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShakeError(false);
    setIsLoading(true);


    // Проверка на пустые поля
    if (!email || !password) {
      setIsLoading(false);
      setError('Пожалуйста, заполните все поля');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    // Проверка для формы регистрации
    if (isRegistering) {
      if (!confirmPassword) {
        setIsLoading(false);
        setError('Пожалуйста, подтвердите пароль');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }
      if (password !== confirmPassword) {
        setIsLoading(false);
        setError('Пароли не совпадают');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }

      try {
        const response = await register(email, password);
        if (response.ok) {
          setIsCodeRequested(true);
          console.log('Код отправлен на почту');
        } else {
          if (handleUnauthorized(response)) return;
          setError('Ошибка при регистрации');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
      } catch (error) {
        setError('Ошибка при регистрации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerificationCodeSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await verifyToken(email, verificationCode, 'VERIFY_EMAIL');
      
      // Проверяем наличие токена и данных пользователя в ответе
      if (response.ok && response.token && response.user) {
        // Сохраняем токен
        saveToken(response.token);
        
        // Обновляем контекст авторизации с полными данными пользователя
        authLogin(response.token, {
          id: response.user.id,
          name: response.user.name,
          username: response.user.username,
          email: response.user.email,
          tg_id: response.user.tg_id,
          role: response.user.role,
          region: response.user.region,
          notifications: response.user.notifications || []
        });
        
        console.log('Верификация успешна:', {
          token: response.token.substring(0, 20) + '...',
          user: { ...response.user, password: '***' }
        });
        
        navigate('/events');
      } else {
        if (handleUnauthorized(response)) return;
        
        setError(response.error || 'Ошибка при верификации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } catch (error) {
      if (handleUnauthorized(error)) return;
      
      console.error('Ошибка при верификации:', error);
      setError(error.message || 'Ошибка при верификации');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
  };

  return {
    isRegistering,
    email,
    password,
    confirmPassword,
    verificationCode,
    isCodeRequested,
    error,
    shakeError,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleVerificationCodeChange,
    handleSubmit,
    handleVerificationCodeSubmit,
    toggleForm,
    userData,
    token,
    isForgotPassword,
    handleForgotPassword,
    handleConfirmPasswordChange,
  };
};

export default useLoginRegistration;
