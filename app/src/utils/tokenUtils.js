export const setTokenWithExpiry = (token, expiryDays = 7) => {
  const now = new Date();
  const item = {
    value: token,
    expiry: now.getTime() + (expiryDays * 24 * 60 * 60 * 1000),
  }
  localStorage.setItem('userToken', JSON.stringify(item));
}

export const getTokenFromStorage = () => {
  const itemStr = localStorage.getItem('userToken');
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem('userToken');
    return null;
  }
  return item.value;
}

export const removeToken = () => {
  localStorage.removeItem('userToken');
} 