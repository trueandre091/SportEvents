export const setTokenWithExpiry = (token) => {
  const item = {
    value: token,
    timestamp: new Date().getTime()
  }
  console.log('Сохранение токена:', {
    token: token.substring(0, 20) + '...',
    timestamp: new Date(item.timestamp).toLocaleString()
  });
  localStorage.setItem('userToken', JSON.stringify(item));
}

export const getTokenFromStorage = () => {
  const itemStr = localStorage.getItem('userToken');
  
  if (!itemStr) {
    console.log('Токен не найден в хранилище');
    return null;
  }

  try {
    const item = JSON.parse(itemStr);
    console.log('Токен получен из хранилища:', {
      token: item.value.substring(0, 20) + '...',
      timestamp: new Date(item.timestamp).toLocaleString()
    });
    return item.value;
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
}

export const removeToken = () => {
  console.log('Удаление токена из хранилища');
  localStorage.removeItem('userToken');
} 