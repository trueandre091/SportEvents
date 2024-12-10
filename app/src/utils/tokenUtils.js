export const setTokenWithExpiry = (token) => {
  const item = {
    value: token
  }
  localStorage.setItem('userToken', JSON.stringify(item));
}

export const getTokenFromStorage = () => {
  const itemStr = localStorage.getItem('userToken');
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);

  return item.value;
}

export const removeToken = () => {
  localStorage.removeItem('userToken');
} 