// Функция для конвертации времени в московское
export const convertToMoscowTime = (dateString) => {
  const moscowOffset = 3; // UTC+3 для Москвы
  const date = new Date(dateString);
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * moscowOffset));
};

// Форматирование даты в московском времени
export const formatMoscowDate = (dateString) => {
  const moscowDate = convertToMoscowTime(dateString);
  return moscowDate.toLocaleString('ru-RU', { 
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 