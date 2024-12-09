import * as React from 'react';
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
  const [verificationCode, setVerificationCode] = React.useState('');

  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = React.useCallback((newEmail = email, newPassword = password, newConfirmPassword = confirmPassword) => {
    // Сбрасываем предыдущий таймер, если он был
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    const allFieldsFilled = newEmail && newPassword && (!isRegistering || (newConfirmPassword && newPassword === newConfirmPassword));
    setIsFormValid(allFieldsFilled);

    // Автоматическая отправка только для формы входа
    if (allFieldsFilled && !isRegistering) {
      console.log('Все поля заполнены верно, автоматическая отправка формы входа через 2 секунды');

      // Сохраняем ссылку на новый таймер
      submitTimeoutRef.current = setTimeout(() => {
        console.log('Отправка данных для входа:', { email: newEmail, password: newPassword });
        // Вызов API для отправки данных
        try {
          const response = login(newEmail, newPassword);
          console.log('Ответ от сервера:', response);

          if (response.error || !response.ok) {
            setError(response.error || 'Ошибка при входе');
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
          }
        } catch (error) {
          console.error('Ошибка при входе:', error);
          setError(error.message || 'Ошибка при входе');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
        submitTimeoutRef.current = null;
      }, 2000);
    }
  }, [isRegistering, email, password, confirmPassword]);

  // Хендлеры для обновления полей формы и проверки
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateForm(newEmail, password, confirmPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validateForm(email, newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validateForm(email, password, newConfirmPassword);
  };

  const handleVerificationCodeChange = (e) => {
    const newVerificationCode = e.target.value;
    setVerificationCode(newVerificationCode);
  };

  // Функция для переключения между регистрацией и входом
  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShakeError(false);


    // Проверка на пустые поля
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    // Проверка для формы регистрации
    if (isRegistering) {
      if (!confirmPassword) {
        setError('Пожалуйста, подтвердите пароль');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }

      try {
        const response = register(email, password);
        if (response.error || !response.ok) {
          setError(response.error || 'Ошибка при регистрации');
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        setError(error.message || 'Ошибка при регистрации');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    }
  };

  return {
    isRegistering,
    email,
    password,
    confirmPassword,
    verificationCode,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleVerificationCodeChange,
    handleSubmit,
    toggleForm,
    error,
    shakeError
  };
};

export default useLoginRegistration;
