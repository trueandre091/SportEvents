import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, verifyToken } from '../../api/auth';
import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../../utils/tokenUtils';


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
        console.log('Отправка данных для входа:', { email: newEmail, password: newPassword });
        // Вызов API для отправки данных
        try {
          const response = await login(newEmail, newPassword);
          if (response.token) {
            saveToken(response.token);
            setUserData(response.user);
            console.log({'Токен и данные пользователя установлены': response});
            navigate('/events');
          } else {
            setError('Ошибка при входе');
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
          }
        } catch (error) {
          console.error('Ошибка при входе:', error);
          setError(error.message || 'Ошибка при входе');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        } finally {
          setIsLoading(false);
        }
        submitTimeoutRef.current = null;
      }, 2000);
    }
  }, [isRegistering, email, password, confirmPassword, navigate, saveToken]);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
        if (response.response === 200) {
          setIsCodeRequested(true);
          console.log('Код отправлен на почту');
        } else {
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
        saveToken(response.token);
        setUserData(response.user);
        console.log('Токен и данные пользователя установлены', response);
        navigate('/events');
      } else {
        setError('Ошибка при верификации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } catch (error) {
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
