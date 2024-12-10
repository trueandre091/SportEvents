import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../api/auth';

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
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  

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
          console.log('Ответ от сервера:', response);

          if (response.error || !response.ok) {
            setIsLoading(false);
            setError(response.error || 'Ошибка при входе');
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
          }
          setIsLoading(false);
          navigate('/events');
        } catch (error) {
          setIsLoading(false);
          console.error('Ошибка при входе:', error);
          setError(error.message || 'Ошибка при входе');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
        submitTimeoutRef.current = null;
      }, 2000);
    }
  }, [isRegistering, email, password, confirmPassword, navigate]);

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

  const handleRequestCode = () => {
    // Здесь будет логика отправки кода на email
    setIsCodeRequested(true);
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
        if (response.error || !response.ok) {
          setIsLoading(false);
          setError(response.error || 'Ошибка при регистрации');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        } else {
          setIsLoading(false);
          setIsRegistered(true);
          setIsCodeRequested(true);
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Ошибка при регистрации:', error);
        setError(error.message || 'Ошибка при регистрации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    }
  };

  const handleVerificationCodeSubmit = async () => {
    // Здесь будет логика отправки кода подтверждения
    console.log('Отправка кода подтверждения:', verificationCode);
  };

  return {
    isRegistering,
    email,
    password,
    confirmPassword,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    toggleForm,
    error,
    shakeError,
    isCodeRequested,
    verificationCode,
    handleVerificationCodeChange,
    handleVerificationCodeSubmit,
    isRegistered,
    isLoading
  };
};

export default useLoginRegistration;
