import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message || 'Неверный email или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <button onClick={() => navigate('/')} className="home-button">
          На главную
        </button>
        <h1 className="header__title">ВХОД</h1>
      </div>

      <main>
        <div className="auth-container">
          <h2 className="auth-title">Вход в аккаунт</h2>
          
          <form className="auth-form" onSubmit={handleSubmit}>
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

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="auth-button">Войти</button>
          </form>

          <div className="auth-link">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login; 