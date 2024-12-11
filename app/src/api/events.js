const API_URL = '/api';

export const getEvents = async (isArchive, filters) => {
  try {
    const formData = new FormData();
    formData.append('archive', isArchive.toString());
    
    const { date_start, date_end, discipline, status } = filters;

    if (date_start) {
      formData.append('date_start', date_start);
    }
    if (date_end) {
      formData.append('date_end', date_end);
    }
    if (discipline) {
      formData.append('discipline', discipline);
    }
    if (status) {
      formData.append('status', status);
    }

    console.log('Отправляемые данные:', {
      archive: isArchive,
      date_start,
      date_end,
      discipline,
      status
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
    return { ok: true, events: data };
  } catch (error) {
    console.error('Ошибка при получении событий:', error);
    return { ok: false, error: error.message || 'Ошибка при получении событий' };
  }
};
