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

export const updateUser = async (userData) => {
  const token = getTokenFromStorage();
  const formData = new FormData();

  // Добавляем только те поля, которые определены в userData
  if (userData.name !== undefined && userData.name !== null) formData.append('name', userData.name);
  if (userData.username !== undefined && userData.username !== null) formData.append('username', userData.username);
  if (userData.region !== undefined && userData.region !== null) formData.append('region', userData.region);
  if (userData.tg_id !== undefined && userData.tg_id !== null) formData.append('tg_id', userData.tg_id);
  if (userData.notifications !== undefined && userData.notifications !== null) formData.append('notifications', JSON.stringify(userData.notifications));
  if (userData.is_verified !== undefined && userData.is_verified !== null) formData.append('is_verified', userData.is_verified);
  if (userData.role !== undefined && userData.role !== null) formData.append('role', userData.role);

  console.log('Форма данных для отправки:', userData.name, userData.username, userData.region, userData.tg_id, userData.role);

  try {
    const response = await fetch(`${API_URL}/user/update`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    console.log('Ответ от сервера:', data);

    if (response.status === 401) {
      console.warn('Токен недействителен, удаляем');
      removeToken();
      return { ok: false, error: 'Требуется повторная авторизация' };
    }

    if (!response.ok) {
      console.error('Ошибка обновления профиля:', data);
      return { ok: false, error: data.message || 'Ошибка обновления профиля' };
    }

    // Обновленная обработка ответа в соответствии с форматом бэкенда
    const updatedUserData = {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      tg_id: data.tg_id,
      role: data.role,
      region: data.region
    };

    console.log('Профиль успешно обновлен:', {
      user: { ...updatedUserData }
    });

    return { 
      ok: true, 
      user: updatedUserData 
    };
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    return { ok: false, error: error.message };
  }
};
