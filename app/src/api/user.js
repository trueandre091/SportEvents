import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../utils/tokenUtils';

const API_URL = '/api';

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

export const getUsers = async (role) => {
  try {
    const formData = new FormData();
    formData.append('role', role.toString().toUpperCase());

    const token = getTokenFromStorage();

    console.log("Запрос пользователей по роли:", role.toString().toUpperCase());

    const response = await fetch(`${API_URL}/user/get`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, users: data };
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    return { ok: false, error: error.message || 'Ошибка при получении пользователей' };
  }
};