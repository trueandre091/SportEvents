const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
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
        return !!this.getToken();
    },

    async register(formData) {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            form.append(key, value);
            console.log(`Добавлено поле ${key}:`, value);
        });

        console.log('URL запроса:', '/api/auth/register');
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: form
            });

            console.log('Статус ответа:', response.status);
            console.log('Заголовки ответа:', Object.fromEntries(response.headers));

            const responseText = await response.text();
            console.log('Текст ответа:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Ошибка парсинга JSON:', e);
                throw new Error('Некорректный формат ответа от сервера');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при регистрации');
            }

            if (data.token) {
                this.setToken(data.token);
                if (data.user) {
                    this.setUser(data.user);
                }
            }

            return data;
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        }
    },

    async login(credentials) {
        const form = new FormData();
        Object.entries(credentials).forEach(([key, value]) => {
            form.append(key, value);
        });

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: form
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка при входе');
        }

        if (data.token) {
            this.setToken(data.token);
            if (data.user) {
                this.setUser(data.user);
            }
        }

        return data;
    },

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Ошибка при выходе из системы');
            }
        } finally {
            this.removeToken();
            this.removeUser();
        }
    },

    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 
            'Authorization': `Bearer ${token}`
        } : {};
    },

    async getProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const responseText = await response.text();
            console.log('Ответ от сервера:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Ошибка парсинга JSON:', e);
                throw new Error('Некорректный формат ответа от сервера');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при получении профиля');
            }

            return data;
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
            throw error;
        }
    }
}; 