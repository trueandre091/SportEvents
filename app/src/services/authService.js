import { TOKEN_TYPES } from '../constants/tokenTypes';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';
const API_URL = '/api';

export const authService = {
    setToken(token) {
        console.log('Сохраняем токен:', token);
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('Получен токен:', token);
        return token;
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    },

    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    removeUser() {
        localStorage.removeItem(USER_KEY);
    },

    isAuthenticated() {
        const token = this.getToken();
        console.log('Проверка авторизации, токен:', token);
        return !!token;
    },

    async register(formData) {
        const form = new FormData();
        form.append('email', formData.email);
        form.append('password', formData.password);
        if (formData.tg_id) {
            form.append('tg_id', formData.tg_id);
        }

        try {
            console.log('Отправка запроса на регистрацию:', `${API_URL}/auth/register`);
            
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                body: form,
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Статус ответа:', response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка при регистрации');
            }

            return response.json();
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            throw error;
        }
    },

    async verifyEmail(email, verifyToken) {
        try {
            const form = new FormData();
            form.append('email', email);
            form.append('verify_token', parseInt(verifyToken));
            form.append('token_type', 'verify_email');

            console.log('Отправка запроса верификации:', {
                email,
                verify_token: parseInt(verifyToken),
                token_type: 'verify_email'
            });

            const response = await fetch(`${API_URL}/auth/verify_token`, {
                method: 'POST',
                body: form,
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Статус ответа:', response.status);
            
            const responseText = await response.text();
            console.log('Текст ответа:', responseText);

            if (!response.ok) {
                try {
                    const error = JSON.parse(responseText);
                    throw new Error(error.message || 'Неверный код подтверждения');
                } catch (e) {
                    throw new Error('Ошибка сервера при верификации');
                }
            }

            const data = JSON.parse(responseText);
            this.setToken(data.token);
            this.setUser(data.user);
            return data;
        } catch (error) {
            console.error('Ошибка при верификации:', error);
            throw error;
        }
    },

    async login(credentials) {
        const form = new FormData();
        Object.entries(credentials).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                form.append(key, value);
            }
        });

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: form,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Ответ от сервера при входе:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Ошибка при входе');
            }

            if (data.token) {
                this.setToken(data.token);
                if (data.user) {
                    this.setUser(data.user);
                }
            }

            return data;
        } catch (error) {
            console.error('Ошибка при входе:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': this.getToken(),
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || data.message || 'Ошибка при выходе из системы');
            }
        } finally {
            this.removeToken();
            this.removeUser();
        }
    },

    getAuthHeaders() {
        const token = this.getToken();
        console.log('Заголовки авторизации, токен:', token);
        return {
            'Authorization': token,
            'Accept': 'application/json'
        };
    },

    async getProfile() {
        try {
            console.log('Getting profile, token:', this.getToken());
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': this.getToken(),
                    'Accept': 'application/json'
                }
            });

            console.log('Profile response status:', response.status);
            const data = await response.json();
            console.log('Profile data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get profile');
            }

            return data;
        } catch (error) {
            console.error('Error in getProfile:', error);
            throw error;
        }
    },

    async verifyToken(email, token, tokenType, password = null) {
        const form = new FormData();
        form.append('email', email);
        form.append('verify_token', token);
        form.append('token_type', tokenType);
        if (password) {
            form.append('password', password);
        }

        try {
            const response = await fetch(`${API_URL}/auth/verify_token`, {
                method: 'POST',
                body: form,
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
            throw error;
        }
    },

    async updateProfile(userData) {
        try {
            const formData = new FormData();
            
            // Добавляем все поля в FormData
            formData.append('id', userData.id);
            formData.append('name', userData.name);
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('tg_id', userData.tg_id);
            formData.append('notifications', JSON.stringify(userData.notifications || []));

            console.log('Update data:', userData);

            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Authorization': this.getToken()
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка при обновлении профиля');
            }

            const updatedUser = await response.json();
            this.setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            throw error;
        }
    }
};