import { getTokenFromStorage } from '../utils/tokenUtils';

const API_URL = '/api';

export const getEvents = async (isArchive) => {
  try {
    const formData = new FormData();
    formData.append('archive', isArchive.toString());

    console.log('Отправляемые данные:', {
      archive: isArchive
    });

    const response = await fetch(`${API_URL}/fsp/events`, {
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
    console.log('Данные событий:', data);
    return { ok: true, events: data };
  } catch (error) {
    console.error('Ошибка при получении событий:', error);
    return { ok: false, error: error.message || 'Ошибка при получении событий' };
  }
};

const formatDateForApi = (dateStr) => {
  // Преобразуем дату в формат YYYY-MM-DD
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createEvent = async (eventData) => {
  const token = getTokenFromStorage();
  console.log('Данные события для создания:', eventData);

  try {
    const formData = new FormData();
    
    // Добавляем все поля в FormData
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        if (key === 'files') {
          // Добавляем каждый файл отдельно
          eventData.files.forEach(file => {
            formData.append('files', file);
          });
        } else if (key === 'date_start' || key === 'date_end') {
          // Преобразуем даты в формат YYYY-MM-DD
          formData.append(key, formatDateForApi(eventData[key]));
        } else {
          formData.append(key, eventData[key].toString());
        }
      }
    });

    const response = await fetch(`${API_URL}/fsp/events/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': token
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Ошибка! Статус: ${response.status}`);
    }

    console.log('Ответ сервера:', data);
    return { ok: true, data };
  } catch (error) {
    console.error('Ошибка при создании события:', error);
    return { ok: false, error: error.message || 'Ошибка при создании события' };
  }
};

export const archiveEvent = async (id) => {
  const token = getTokenFromStorage();
  try {
    const formData = new FormData();
    formData.append('archive', id.toString());

    console.log('Отправляемые данные:', {
      archive: id
    });

    const response = await fetch(`${API_URL}/fsp/events/archive`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': token
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();
    console.log('Данные события:', data);
    return { ok: true, event: data };
  } catch (error) {
    console.error('Ошибка при архивировании события:', error);
    return { ok: false, error: error.message || 'Ошибка при архивировании события' };
  }
};

export const updateEvent = async (eventData) => {
  const token = getTokenFromStorage();
  console.log('Данные события для обновления:', eventData);

  try {
    const formData = new FormData();
    
    // Добавляем все поля в FormData
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        if (key === 'files') {
          // Добавляем каждый файл отдельно
          eventData.files.forEach(file => {
            if (file instanceof File) {
              formData.append('files', file);
            }
          });
        } else if (key === 'date_start' || key === 'date_end') {
          // Преобразуем даты в формат YYYY-MM-DD
          formData.append(key, formatDateForApi(eventData[key]));
        } else if (key === 'representative') {
          formData.append(key, eventData[key].id);
        } else {
          formData.append(key, eventData[key].toString());
        }
      }
    });

    const response = await fetch(`${API_URL}/fsp/events/update`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': token
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Ошибка! Статус: ${response.status}`);
    }

    console.log('Ответ сервера:', data);
    return { ok: true, data };
  } catch (error) {
    console.error('Ошибка при обновлении события:', error);
    return { ok: false, error: error.message || 'Ошибка при обновлении события' };
  }
};
