const API_URL = 'http://app-container:5000';

export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    console.log(formData);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    return error;
  }
};

export const register = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    console.log(formData);

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': this.getToken(),
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      return data.error || data.message || 'Ошибка при выходе из системы';
    }
  } finally {
    this.removeToken();
    this.removeUser();
  }
};

export const verifyToken = async (email, token, tokenType, password = null) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('verify_token', token);
  formData.append('token_type', tokenType);
  if (password) {
    formData.append('password', password);
  }
  console.log(formData);

  try {
    const response = await fetch(`${API_URL}/api/auth/verify_token`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Ошибка при верификации токена');
    }

    if (data.token) {
      this.setToken(data.token);
      if (data.user) {
        this.setUser(data.user);
      }
    }

    return data;
  } catch (error) {
    console.error('Ошибка при верификации:', error);
    return error;
  }
};

export const getProfile = async () => {
  try {
    console.log('Getting profile, token:', this.getToken());
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'POST',
      headers: {
        'Authorization': this.getToken(),
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      return data.message || 'Failed to get profile';
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return error;
  }
};
