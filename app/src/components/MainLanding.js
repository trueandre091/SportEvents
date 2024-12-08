import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import FSPLogo from './FSPLogo';
import './MainLanding.css';

const checkAuth = () => {
    return authService.isAuthenticated();
};

function MainLanding() {
    const navigate = useNavigate();
    const navItems = [
        { title: "профиль", path: "/profile", requiresAuth: true },
        { title: "регионы", path: "/regions", requiresAuth: false },
        { title: "события", path: "/events", requiresAuth: false },
        { title: "контакты", path: "/contacts", requiresAuth: false },
        { title: "антидопинг", path: "/antidoping", requiresAuth: false }
    ];
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        confirmPassword: '',
        tg_id: '',
        verifyToken: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [terminalLines, setTerminalLines] = useState([]);
    const [currentLine, setCurrentLine] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const commands = {
        'help': 'Доступные команды: about, contact, social, clear',
        'about': 'ФСП - Федерация спортивного программирования России',
        'contact': 'Email: info@fsp.ru | Тел: +7 (999) 123-45-67',
        'social': 'VK: fsp_ru | Telegram: @fsp_russia',
        'clear': 'CLEAR_TERMINAL'
    };
    const [showModal, setShowModal] = useState(false);
    const [representatives, setRepresentatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchEvents();
        // Начальное сообщение в терминале
        addTerminalLine('Добро пожаловать в ФСП терминал! Введите "help" для списка команд.');
    }, []);

    useEffect(() => {
        if (error) {
            setError('');
        }

        // Очищаем предыдущий таймер
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Оставляем только для формы входа
        if (formData.email && formData.password && isLoginForm) {
            const newTimeout = setTimeout(() => {
                handleLogin();
            }, 2000);
            setTypingTimeout(newTimeout);
        }

        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [formData]);

    useEffect(() => {
        const checkAuth = async () => {
            const auth = authService.isAuthenticated();
            setIsAuthenticated(auth);
            
            if (auth) {
                try {
                    const data = await authService.getProfile();
                    setUserData(data);
                } catch (error) {
                    console.error('Ошибка при получении данных профиля:', error);
                }
            }
        };

        checkAuth();
    }, []);

    const fetchEvents = async () => {
        try {
            const formData = new FormData();
            formData.append('archive', 'False');

            const response = await fetch('/api/fsp/events', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении событий');
            }

            const data = await response.json();
            setEvents(data.slice(0, 9));
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setEventsLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const credentials = {
                email: formData.email,
                password: formData.password
            };

            await authService.login(credentials);
            
            // После успешного входа перенаправляем на профиль
            navigate('/profile');

        } catch (err) {
            setError(err.message || 'Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            if (formData.password !== formData.confirmPassword) {
                setError('Пароли не совпадают');
                return;
            }

            setIsLoading(true);
            setError('');

            const registerData = {
                email: formData.email,
                password: formData.password
            };
            
            if (formData.tg_id) {
                registerData.tg_id = parseInt(formData.tg_id);
            }

            await authService.register(registerData);
            setShowVerification(true);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async () => {
        try {
            setIsLoading(true);
            setError('');

            await authService.verifyEmail(formData.email, formData.verifyToken);
            navigate('/profile');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addTerminalLine = (text, isCommand = false) => {
        setTerminalLines(prev => [...prev, { text, isCommand }]);
    };

    const handleTerminalSubmit = (e) => {
        e.preventDefault();
        const command = currentLine.toLowerCase().trim();
        
        if (command) {
            addTerminalLine(`> ${command}`, true);
            
            if (command in commands) {
                if (commands[command] === 'CLEAR_TERMINAL') {
                    setTerminalLines([]);
                } else {
                    addTerminalLine(commands[command]);
                }
            } else {
                addTerminalLine('Команда не распознана. Введите "help" для списка команд.');
            }
        }
        
        setCurrentLine('');
    };

    const handleNavigation = (path, requiresAuth) => {
        if (requiresAuth && !authService.isAuthenticated()) {
            setError('Для доступа к этой странице необходимо войти в систему');
            return;
        }
        navigate(path);
    };

    const handleFormSwitch = () => {
        setIsLoginForm(!isLoginForm);
        setFormData({ email: '', password: '', confirmPassword: '', tg_id: '', verifyToken: '' });
        setError('');
    };

    const fetchRepresentatives = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('role', 'REGIONAL_ADMIN');

            const response = await fetch('/api/user/get', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении списка представителей');
            }

            const data = await response.json();
            setRepresentatives(data.data || []);
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        fetchRepresentatives();
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleLogout = () => {
        authService.removeToken();
        authService.removeUser();
        setIsAuthenticated(false);
        setUserData(null);
        navigate('/');
    };

    const handleSubscribe = async (eventId) => {
        if (!authService.isAuthenticated()) {
            setError('Для подписки на событие необходимо войти в систему');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('id', eventId);

            const response = await fetch('/api/fsp/events/subscribe', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': authService.getToken()
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при подписке на событие');
            }

            // Обновляем список событий после успешной подписки
            fetchEvents();
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        }
    };

    const renderLoginOrWelcome = () => {
        if (authService.isAuthenticated()) {
            return (
                <div className="welcome-section">
                    <div className="welcome-container">
                        <div className="welcome-icon">👋</div>
                        <h2>Добро пожаловать!</h2>
                        <p>Вы успешно вошли в систему</p>
                        {userData && (userData.role === 'CENTRAL_ADMIN' || 
                                    userData.role === 'REGIONAL_ADMIN' || 
                                    userData.role === 'ADMIN') && (
                            <button 
                                className="admin-panel-button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/profile/admin');
                                }}
                            >
                                Перейти в админ-панель
                            </button>
                        )}
                        <button 
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Выйти из системы
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="login-section">
                <div className={`login-container ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}>
                    <div className="register-link">
                        <button 
                            onClick={handleFormSwitch} 
                            className="switch-form-button"
                        >
                            {isLoginForm ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </div>
                    <div className="login-form">
                        <h2>{isLoginForm ? 'Войти' : 'Регистрация'}</h2>
                        {!checkAuth() && !isLoginForm && error && (
                            <div className="error-message">{error}</div>
                        )}
                        <form className="form-content" onSubmit={e => e.preventDefault()}>
                            <input
                                type="email"
                                name="email"
                                placeholder="почта"
                                className={`form-input ${error ? 'input-error' : ''}`}
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="пароль"
                                className={`form-input ${error ? 'input-error' : ''}`}
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {!isLoginForm && (
                                <>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="подтвердите пароль"
                                        className={`form-input ${error ? 'input-error' : ''}`}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="tg_id"
                                        placeholder="telegram ID (необязательно)"
                                        className={`form-input ${error ? 'input-error' : ''}`}
                                        value={formData.tg_id}
                                        onChange={handleInputChange}
                                    />
                                    <button 
                                        onClick={handleRegister}
                                        className="register-button"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                                    </button>
                                </>
                            )}
                            {!isLoginForm && showVerification && (
                                <div className="verification-container">
                                    <input
                                        type="text"
                                        name="verifyToken"
                                        placeholder="Введите код из письма"
                                        className={`form-input ${error ? 'input-error' : ''}`}
                                        value={formData.verifyToken}
                                        onChange={handleInputChange}
                                    />
                                    <button 
                                        onClick={handleVerification}
                                        className="verify-button"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Проверка...' : 'Подтвердить'}
                                    </button>
                                </div>
                            )}
                            {error && <div className="error-message">{error}</div>}
                            {isLoginForm && (
                                <div className="forgot-password">
                                    <a href="/forgot-password">забыли пароль?</a>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="landing-page">
            <header className="header-container">
                <div className="header-content">
                    <div 
                        className="logo-container"
                        onClick={() => handleNavigation('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FSPLogo className="h-10 w-10" />
                        <span className="logo-text">ФСП</span>
                    </div>
                    <nav className="nav-menu">
                        {navItems.map((item) => (
                            <button
                                key={item.title}
                                className="nav-link"
                                onClick={() => handleNavigation(item.path, item.requiresAuth)}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <div className="text-section">
                    <h1>Федерация спортивного программирования</h1>
                    <p className="description">
                        Это общественная спортивная организация, которая развивает и 
                        популяризирует спортивное программирование в России, проводит 
                        соревнования национального уровня. Мы также занимаемся формированием 
                        национальных сборных, обучением и аттестацией спортивных судей, 
                        аккредитацией площадок, подготовкой методических материалов, 
                        образовательными проектами, развитием клубов и секций.
                    </p>
                </div>

                {renderLoginOrWelcome()}
            </main>

            <section className="main-events-section">
                <div className="main-events-container">
                    <h2 className="main-events-title">Актуальные события</h2>
                    <div className="main-events-grid">
                        {eventsLoading ? (
                            <div className="main-events-loading">Загрузка событий...</div>
                        ) : events.length > 0 ? (
                            events.slice(0, 9).map(event => (
                                <div key={event.id} className="main-event-card">
                                    <div className="main-event-header">
                                        <span className="main-event-type">{event.type}</span>
                                        <span className={`main-event-status ${
                                            event.status === "Регистрация открыта" ? "main-status-open" : "main-status-soon"
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <h3 className="main-event-title">{event.title}</h3>
                                    <div className="main-event-info">
                                        <div className="main-event-detail">
                                            <span className="main-detail-label">Дата:</span>
                                            <span className="main-detail-value">{event.date}</span>
                                        </div>
                                        <div className="main-event-detail">
                                            <span className="main-detail-label">Место:</span>
                                            <span className="main-detail-value">{event.location}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="main-event-subscribe-button"
                                        onClick={() => handleSubscribe(event.id)}
                                        disabled={event.status !== "Регистрация открыта"}
                                    >
                                        {event.is_subscribed ? "Вы подписаны" : "Подписаться"}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="main-no-events">Нет актуальных событий</div>
                        )}
                    </div>
                </div>
            </section>

            <footer className="terminal-footer">
                <div className="terminal-container">
                    <div className="terminal-header">
                        <div className="terminal-buttons">
                            <span className="terminal-button red"></span>
                            <span className="terminal-button yellow"></span>
                            <span className="terminal-button green"></span>
                        </div>
                        <div className="terminal-title">fsp-terminal</div>
                    </div>
                    <div className="terminal-content">
                        {terminalLines.map((line, index) => (
                            <div key={index} className={`terminal-line ${line.isCommand ? 'command' : ''}`}>
                                {line.isCommand ? '> ' : ''}{line.text}
                            </div>
                        ))}
                        <form onSubmit={handleTerminalSubmit} className="terminal-input-line">
                            <span className="terminal-prompt">{'>'}</span>
                            <input
                                type="text"
                                value={currentLine}
                                onChange={(e) => setCurrentLine(e.target.value)}
                                className="terminal-input"
                                placeholder="Введите команду..."
                                spellCheck="false"
                                autoComplete="off"
                            />
                        </form>
                    </div>
                </div>
            </footer>

            <button onClick={handleOpenModal} className="nav-link">
                Региональные представители ФСП
            </button>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Региональные представители ФСП</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>

                        <button className="add-representative">
                            <span>+</span> представитель
                        </button>

                        {loading ? (
                            <div className="loading-text">Загрузка...</div>
                        ) : error ? (
                            <div className="error-text">{error}</div>
                        ) : (
                            <div className="representatives-list">
                                <div className="representative-row representative-header">
                                    <div>представитель</div>
                                    <div>регион</div>
                                    <div>контакт</div>
                                    <div>действия</div>
                                </div>
                                {representatives.map((rep) => (
                                    <div key={rep.id} className="representative-row">
                                        <div>{rep.name}</div>
                                        <div>{rep.region}</div>
                                        <div>{rep.email}</div>
                                        <div className="representative-actions">
                                            <button className="action-button edit">✎</button>
                                            <button className="action-button delete">🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainLanding; 