import { setTokenWithExpiry, getTokenFromStorage, removeToken } from '../utils/tokenUtils';

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

export const createEvent = async (eventData) => {
  const token = getTokenFromStorage();

  try {
    const formData = new FormData();
    
    // Добавляем все поля в FormData
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        if (key === 'file') {
          // Переименовываем поле file в files для множественной загрузки
          formData.append('files', eventData[key]);
        } else if (key === 'date_start' || key === 'date_end') {
          // Преобразуем даты в нужный формат YYYY-MM-DD
          formData.append(key, eventData[key]);
        } else {
          formData.append(key, eventData[key].toString());
        }
      }
    });

    // Не отправляем representative, он будет установлен на бекенде
    formData.delete('representative');

    // Выводим все данные, которые будут отправлены
    const formDataEntries = {};
    for (let [key, value] of formData.entries()) {
      formDataEntries[key] = value;
    }
    
    console.log('Отправляемые данные FormData:', formDataEntries);

    const response = await fetch(`${API_URL}/fsp/events/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': token
        // Не указываем Content-Type, он будет установлен автоматически для FormData
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
