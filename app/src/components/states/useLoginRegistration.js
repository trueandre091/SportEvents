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
import { login, register, verifyToken } from '../../api/auth';
import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../../utils/tokenUtils';
import { useAuth } from '../../context/AuthContext';


const useLoginRegistration = () => {  
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
  const [userData, setUserData] = React.useState(null);
  const [token, setToken] = React.useState(getTokenFromStorage());

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
  const { login: authLogin } = useAuth();

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


  const validateForm = React.useCallback( async (newEmail = email, newPassword = password, newConfirmPassword = confirmPassword) => {
    // Сбрасываем предыдущий таймер, если он был
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    const allFieldsFilled = newEmail && newPassword && (!isRegistering || (newConfirmPassword && newPassword === newConfirmPassword));
    setIsFormValid(allFieldsFilled);

    // Автоматическая отправка только для формы входа
    if (allFieldsFilled && !isRegistering) {
      setIsLoading(true);
      console.log('Все поля заполнены верно, автоматическая отправка формы входа через 2 секунды');

      // Сохраняем ссылку на новый таймер
      submitTimeoutRef.current = setTimeout(async () => {
        // Вызов API для отправки данных
        try {
          console.log('Отправка данных:', { email: newEmail, password: newPassword });
          
          const response = await login(newEmail, newPassword);
          console.log('Получен ответ:', response);

          if (response.error) {
            setError(response.error);
            setShakeError(true);
            return;
          }

          if (!response.token) {
            setError('Отсутствует токен в ответе');
            setShakeError(true);
            return;
          }

          // Успешный вход
          console.log('Успешный вход, сохраняем токен и обновляем контекст');
          saveToken(response.token);
          authLogin(response.token, response.user); // Обновляем контекст
          navigate('/events');

        } catch (error) {
          console.error('Ошибка в процессе входа:', error);
          setError('Произошла ошибка при входе');
          setShakeError(true);
        } finally {
          setIsLoading(false);
          setTimeout(() => setShakeError(false), 500);
          submitTimeoutRef.current = null;
        }
      }, 2000);
    }
  }, [isRegistering, email, password, confirmPassword, navigate, saveToken, authLogin]);

  // Хендлеры для обновления полей формы и проверки
  const handleEmailChange = async(e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    await validateForm(newEmail, password, confirmPassword);
  };

  const handlePasswordChange = async(e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    await validateForm(email, newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = async(e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    await validateForm(email, password, newConfirmPassword);
  };

  const handleVerificationCodeChange = async(e) => {
    setVerificationCode(e.target.value);
  };

  // Функция для переключения между регистрацией и входом
  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
  };

  // Функция для проверки ответа на 401 ошибку
  const handleUnauthorized = React.useCallback((error) => {
    if (error.status === 401 || error.response?.status === 401) {
      console.log('Unauthorized error detected, removing token');
      removeToken();
      setToken(null);
      setUserData(null);
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
      const response = await verifyToken(email, verificationCode, 'registration');
      if (response.token) {
        handleLoginSuccess();
        saveToken(response.token);
        setUserData(response.user);
        console.log('Токен и данные пользователя установлены', response);
        navigate('/events');
      } else {
        if (handleUnauthorized(response)) return;
        setError('Ошибка при верификации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setError('Ошибка при верификации');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = React.useCallback(() => {
    removeToken();
    setToken(null);
    setUserData(null);
    navigate('/login');
  }, [navigate]);

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
    handleConfirmPasswordChange,
    handleVerificationCodeChange,
    handleSubmit,
    handleVerificationCodeSubmit,
    toggleForm,
    userData,
    token
  };
};

export default useLoginRegistration;
