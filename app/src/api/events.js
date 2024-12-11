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
    return { ok: true, events: data };
  } catch (error) {
    console.error('Ошибка при получении событий:', error);
    return { ok: false, error: error.message || 'Ошибка при получении событий' };
  }
};
