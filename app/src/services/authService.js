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

    async register(userData) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

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
    },

    async login(credentials) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
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
                },
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }
}; 