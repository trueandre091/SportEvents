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
    if (role) {
      formData.append('role', role.toString().toUpperCase());
    }

    const token = getTokenFromStorage();

    console.log("Отправляем запрос на получение пользователей:", {
      role: role,
      token: token
    });

    const response = await fetch(`${API_URL}/user/get`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    console.log("Получен ответ:", {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    console.log("Получены данные пользователей:", data);
    
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
  
  // Проверяем, что tg_id является числом
  if (userData.tg_id !== undefined && userData.tg_id !== null) {
    const tg_id = parseInt(userData.tg_id);
    if (!isNaN(tg_id)) {
      formData.append('tg_id', tg_id.toString());
    }
  }
  
  if (userData.notifications !== undefined && userData.notifications !== null) formData.append('notifications', JSON.stringify(userData.notifications));
  if (userData.is_verified !== undefined && userData.is_verified !== null) formData.append('is_verified', userData.is_verified);
  if (userData.role !== undefined && userData.role !== null) formData.append('role', userData.role);

  console.log('Форма данных для отправки:', userData.name, userData.username, userData.region, userData.tg_id, userData.role);

  try {
    const response = await fetch(`${API_URL}/user/update_admin`, {
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

export const updateUserProfile = async (userData) => {
  const token = getTokenFromStorage();
  const formData = new FormData();

  // Добавляем только те поля, которые определены в userData
  if (userData.name !== undefined && userData.name !== null) formData.append('name', userData.name);
  if (userData.username !== undefined && userData.username !== null) formData.append('username', userData.username);
  if (userData.region !== undefined && userData.region !== null) formData.append('region', userData.region);
  
  // Проверяем, что tg_id является числом
  if (userData.tg_id !== undefined && userData.tg_id !== null) {
    const tg_id = parseInt(userData.tg_id);
    if (!isNaN(tg_id)) {
      formData.append('tg_id', tg_id.toString());
    }
  }
  
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

export const getNotifications = async () => {
  const token = getTokenFromStorage();

  try {
    const response = await fetch(`${API_URL}/user/get_notifications`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении событий');
    }

    const data = await response.json();
    console.log('Полученные уведомления:', data);
    return { ok: true, events: data };
  } catch (error) {
    console.error('Ошибка при получении событий пользователя:', error);
    return { ok: false, error: error.message };
  }
};

export const subscribeToEvent = async (eventId) => {
  const token = getTokenFromStorage();
  const formData = new FormData();
  formData.append('id', eventId);

  try {
    const response = await fetch(`${API_URL}/user/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    console.log('Ответ от сервера при подписке:', data);

    if (!response.ok) {
      console.error('Ошибка при подписке:', data);
      return { ok: false, error: data.message || 'Ошибка при подписке на событие' };
    }

    return {
      ok: true,
      event: data
    };
  } catch (error) {
    console.error('Ошибка при подписке на событие:', error);
    return { ok: false, error: error.message || 'Ошибка при подписке на событие' };
  }
};

export const unsubscribeToEvent = async (eventId) => {
  const token = getTokenFromStorage();
  const formData = new FormData();
  formData.append('id', eventId);

  try {
    const response = await fetch(`${API_URL}/user/unsubscribe`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    console.log('Ответ от сервера при подписке:', data);

    if (!response.ok) {
      console.error('Ошибка при подписке:', data);
      return { ok: false, error: data.message || 'Ошибка при подписке на событие' };
    }

    return {
      ok: true,
      event: data
    };
  } catch (error) {
    console.error('Ошибка при подписке на событие:', error);
    return { ok: false, error: error.message || 'Ошибка при подписке на событие' };
  }
};


export const setupNotification = async (eventId, data) => {
  const token = getTokenFromStorage();
  const formData = new FormData();
  
  // Добавляем id события
  formData.append('id', eventId);
  
  // Проверяем наличие значений перед преобразованием
  if (data.telegram !== undefined) {
    formData.append('telegram', data.telegram.toString());
  }
  
  if (data.email !== undefined) {
    formData.append('email', data.email.toString());
  }
  
  // Форматируем дату в нужный формат
  if (data.notification_time) {
    const date = new Date(data.notification_time);
    const formattedDate = date.getFullYear() +
      '-' + String(date.getMonth() + 1).padStart(2, '0') +
      '-' + String(date.getDate()).padStart(2, '0') +
      ' ' + String(date.getHours()).padStart(2, '0') +
      ':' + String(date.getMinutes()).padStart(2, '0');
    
    formData.append('notification_time', formattedDate);
  }

  console.log('Отправляемые данные:', {
    id: eventId,
    telegram: data.telegram,
    email: data.email,
    notification_time: formData.get('notification_time')
  });

  try {
    const response = await fetch(`${API_URL}/user/set-up-notification`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const responseData = await response.json();
    console.log('Ответ от сервера при настройке уведомлений:', responseData);

    if (!response.ok) {
      return { ok: false, error: responseData.message || 'Ошибка при настройке уведомлений' };
    }

    return { ok: true, data: responseData };
  } catch (error) {
    console.error('Ошибка при настройке уведомлений:', error);
    return { ok: false, error: error.message };
  }
};

export const getRegions = async () => {
  try {
    const formData = new FormData();
    formData.append('role', "REGIONAL_ADMIN");

    const response = await fetch(`${API_URL}/user/get`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    // Получаем уникальные регионы
    const uniqueRegions = [...new Set(data.map(user => user.region))].filter(Boolean);
    
    console.log('Получены регионы:', uniqueRegions);
    return { ok: true, regions: uniqueRegions };
  } catch (error) {
    console.error('Ошибка при получении регионов:', error);
    return { ok: false, error: error.message || 'Ошибка при получении регионов' };
  }
};

export const deleteUser = async (userId) => {
  const token = getTokenFromStorage();
  const formData = new FormData();
  formData.append('id', userId);

  try {
    const response = await fetch(`${API_URL}/user/delete`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    console.log('Ответ от сервера при удалении пользователя:', data);

    if (!response.ok) {
      console.error('Ошибка при удалении пользователя:', data);
      return { ok: false, error: data.message || 'Ошибка при удалении пользователя' };
    }

    return {
      ok: true,
      user: data
    };
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return { ok: false, error: error.message || 'Ошибка при удалении пользователя' };
  }
};

export const createUser = async (userData) => {
  const token = getTokenFromStorage();
  const formData = new FormData();

  // Добавляем только те поля, которые определены в userData
  if (userData.name !== undefined && userData.name !== null) formData.append('name', userData.name);
  if (userData.username !== undefined && userData.username !== null) formData.append('username', userData.username);
  if (userData.email !== undefined && userData.email !== null) formData.append('email', userData.email);
  if (userData.region !== undefined && userData.region !== null) formData.append('region', userData.region);
  
  // Проверяем, что tg_id является числом
  if (userData.tg_id !== undefined && userData.tg_id !== null) {
    const tg_id = parseInt(userData.tg_id);
    if (!isNaN(tg_id)) {
      formData.append('tg_id', tg_id.toString());
    }
  }
  
  if (userData.notifications !== undefined && userData.notifications !== null) formData.append('notifications', JSON.stringify(userData.notifications));
  if (userData.is_verified !== undefined && userData.is_verified !== null) formData.append('is_verified', userData.is_verified);
  if (userData.role !== undefined && userData.role !== null) formData.append('role', userData.role);

  console.log('Форма данных для отправки:', {
    name: userData.name,
    username: userData.username,
    email: userData.email,
    region: userData.region,
    tg_id: userData.tg_id,
    role: userData.role
  });

  try {
    const response = await fetch(`${API_URL}/user/add`, {
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
      console.error('Ошибка создания пользователя:', data);
      return { ok: false, error: data.message || 'Ошибка создания пользователя' };
    }

    const newUserData = {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      tg_id: data.tg_id,
      role: data.role,
      region: data.region
    };

    console.log('Пользователь успешно создан:', {
      user: { ...newUserData }
    });

    return {
      ok: true,
      user: newUserData
    };
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return { ok: false, error: error.message };
  }
};
