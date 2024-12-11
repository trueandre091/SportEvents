import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../utils/tokenUtils';

const API_URL = '/api';

export const login = async (email, password) => {
  console.log('Попытка входа для:', email);
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Статус ответа входа:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка входа:', errorData);
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    console.log('Успешный вход:', {
      token: data.token ? data.token.substring(0, 20) + '...' : 'отсутствует',
      user: data.user ? { ...data.user, password: '***' } : 'отсутствует'
    });
    
    if (data.token) {
      setTokenWithExpiry(data.token);
    }

    return { ok: true, ...data };
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return { ok: false, error: error.message || 'Ошибка при входе' };
  }
};

export const register = async (email, password) => {
  console.log('Попытка регистрации для:', email);
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData,
    });

    console.log('Статус ответа регистрации:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка регистрации:', errorData);
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    console.log('Успешная регистрация:', {
      token: data.token ? data.token.substring(0, 20) + '...' : 'отсутствует',
      user: data.user ? { ...data.user, password: '***' } : 'отсутствует'
    });

    return { ok: true, ...data };
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return { ok: false, error: error.message || 'Ошибка при регистрации' };
  }
};

export const logout = async () => {
  try {
    const token = getTokenFromStorage();
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      const data = await response.json();
      console.log(data);
      return data.error || data.message || 'Ошибка при выходе из системы';
    }
  } finally {
    removeToken();
  }
};

export const verifyToken = async (email, token, tokenType, password = null) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('verify_token', token);
  formData.append('token_type', tokenType);
  if (password) {
    formData.append('password', password);
  }
  console.log(formData);

  try {
    const response = await fetch(`${API_URL}/auth/verify_token`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log(data);

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Ошибка при верификации токена');
    }

    if (data.token) {
      this.setToken(data.token);
      if (data.user) {
        this.setUser(data.user);
      }
    }

    return data;
  } catch (error) {
    console.error('Ошибка при верификации:', error);
    return error;
  }
};

export const getProfile = async () => {
  const token = getTokenFromStorage();
  console.log('Запрос профиля с токеном:', token ? token.substring(0, 20) + '...' : 'отсутствует');

  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      }
    });

    console.log('Статус ответа профиля:', response.status);
    const data = await response.json();
    console.log('Сырой ответ от сервера:', data);

    if (response.status === 401) {
      console.warn('Токен недействителен, удаляем');
      removeToken();
      return { ok: false, error: 'Требуется повторная авторизация' };
    }

    if (!response.ok) {
      console.error('Ошибка получения профиля:', data);
      return { ok: false, error: data.message || 'Ошибка получения профиля' };
    }

    // Если данные пришли напрямую (не в поле user)
    const userData = data.user || {
      email: data.email,
      name: data.name,
      role: data.role,
      id: data.id,
      tg_id: data.tg_id,
      username: data.username,
      region: data.region,
      is_verified: data.is_verified,
      notifications: data.notifications
    };

    console.log('Успешное получение профиля:', {
      user: { ...userData, password: '***' }
    });

    return { 
      ok: true, 
      user: userData 
    };
  } catch (error) {
    console.error('Ошибка при запросе профиля:', error);
    return { ok: false, error: error.message };
  }
};

export const forgotPassword = async (email) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    const response = await fetch(`${API_URL}/auth/forgot_password`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const data = await response.json();
      console.log(data);
      return data.error || data.message || 'Ошибка при запросе на восстановление пароля';
    }
    return { response: 200 };
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return error;
  }
};
