import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [searchParams] = useSearchParams();
  const tgId = searchParams.get('tg_id');
  const username = searchParams.get('username');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          tg_id: tgId,
          username,
          remember_me: rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    }
  };

  if (!tgId) {
    return (
      <div className="auth-page">
        <div className="auth-header">
          <button onClick={() => navigate('/')} className="home-button">
            На главную
          </button>
          <h1 className="header__title">РЕГИСТРАЦИЯ</h1>
        </div>
        <main>
          <div className="auth-container">
            <div className="error-message">
              Регистрация доступна только через <a href="https://t.me/my_091_bot" className="telegram-link">Telegram бота</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <button onClick={() => navigate('/')} className="home-button">
          На главную
        </button>
        <h1 className="header__title">РЕГИСТРАЦИЯ</h1>
      </div>

      <main>
        <div className="auth-container">
          <h2 className="auth-title">Создание аккаунта</h2>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Telegram ID</label>
              <input type="text" value={tgId} disabled className="disabled-input" />
            </div>

            {username && (
              <div className="form-group">
                <label>Имя пользователя Telegram</label>
                <input type="text" value={username} disabled className="disabled-input" />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="password-input">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  className={`password-control ${showPassword ? 'view' : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Подтверждение пароля</label>
              <input 
                type="password" 
                id="confirm_password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-text">Запомнить меня</span>
              </label>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="auth-button">Зарегистрироваться</button>
          </form>

          <div className="auth-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register; 