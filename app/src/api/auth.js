import { getTokenFromStorage, setTokenWithExpiry, removeToken } from '../utils/tokenUtils';

const API_URL = '/api';

export const login = async (email, password) => {
  return {
    "token": "1111",
    "user": {
      "id": "1111",
      "name": "1111",
      "username": "1111",
      "email": "1111",
      "tg_id": "1111",
      "role": "1111",
      "region": "1111",
      "notifications": []
    }
  };
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

    console.log('Получен ответ:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Получаем текст ответа
    const text = await response.text();
    console.log('Текст ответа:', text);

    // Если ответ пустой, возвращаем объект с ошибкой
    if (!text) {
      return { error: 'Empty response from server' };
    }

    // Пробуем распарсить JSON
    try {
      const data = JSON.parse(text);
      console.log('Успешный ответ:', data);
      
      // Проверяем наличие ошибки в ответе
      if (!response.ok) {
        return { 
          error: data.message || `HTTP error! status: ${response.status}`,
          status: response.status 
        };
      }

      return data;
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e);
      return { error: 'Invalid JSON response from server' };
    }

  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    return { error: error.message || 'Network error' };
  }
};

export const register = async (email, password) => {
  return { response: 200 };
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    console.log(formData);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData,
    });
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log(data);
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return error;
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
  return {
    "token": "1111",
    "user": {
      "id": "1111",
      "name": "1111",
      "username": "1111",
      "email": "1111",
      "tg_id": "1111",
      "role": "1111",
      "region": "1111",
      "notifications": []
    }
  };
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
  try {
    const token = getTokenFromStorage();
    console.log('Getting profile, token:', token);
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log(data);

    if (response.status === 401 || [401].includes(response.status)) {
      removeToken();
      return data;
    }

    if (!response.ok) {
      return data.message || 'Failed to get profile';
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return error;
  }
};
