import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FSPLogo from './FSPLogo';
import './MainLanding.css';

const checkAuth = () => {
    const token = localStorage.getItem('jwt_token');
    return !!token; // Вернет true если токен есть, false если нет
};

function MainLanding() {
    const navigate = useNavigate();
    const navItems = [
        { title: "профиль", path: "/profile" },
        { title: "регионы", path: "/regions" },
        { title: "события", path: "/events" },
        { title: "контакты", path: "/contacts" },
        { title: "антидопинг", path: "/antidoping" }
    ];
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [terminalLines, setTerminalLines] = useState([]);
    const [currentLine, setCurrentLine] = useState('');
    const commands = {
        'help': 'Доступные команды: about, contact, social, clear',
        'about': 'ФСП - Федерация спортивного программирования России',
        'contact': 'Email: info@fsp.ru | Тел: +7 (999) 123-45-67',
        'social': 'VK: fsp_ru | Telegram: @fsp_russia',
        'clear': 'CLEAR_TERMINAL'
    };

    useEffect(() => {
        fetchEvents();
        // Начальное сообщение в терминале
        addTerminalLine('Добро пожаловать в ФСП терминал! Введите "help" для списка команд.');
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
            setEvents(data);
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
            
            // Имитация запроса на сервер
            const response = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Имитация проверки данных
                    if (formData.email === 'test@test.com' && formData.password === 'password') {
                        resolve({ success: true });
                    } else {
                        reject(new Error('Неверный email или пароль'));
                    }
                }, 1500);
            });

            if (response.success) {
                console.log('Вход выполнен успешно');
                // Здесь будет редирект или другая логика после успешного входа
            }
        } catch (err) {
            setError(err.message);
            // Сбрасываем состояние загрузки через небольшую задержку,
            // чтобы пользователь успел увидеть ошибку
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    useEffect(() => {
        // Сбрасываем ошибку при изменении полей
        if (error) {
            setError('');
        }

        // Проверяем, заполнены ли оба поля
        if (formData.email && formData.password) {
            // Очищаем предыдущий таймер
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            // Устанавливаем новый таймер
            const newTimeout = setTimeout(() => {
                handleLogin();
            }, 2000); // Ждем 2 секунды после последнего ввода

            setTypingTimeout(newTimeout);
        }

        // Очищаем таймер при размонтировании
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [formData]); // Следим за изменениями в полях формы

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

    const handleNavigation = (path) => {
        if (path === '/profile') {
            if (!checkAuth()) {
                setError('Для доступа к профилю необходимо войти в систему');
                // Добавим автоматическое скрытие ошибки через 3 секунды
                setTimeout(() => {
                    setError('');
                }, 3000);
                return;
            }
        }
        navigate(path);
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
                                onClick={() => handleNavigation(item.path)}
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

                <div className="login-section">
                    <div className={`login-container ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}>
                        <div className="register-link">
                            <a href="/register">Зарегистрироваться</a>
                        </div>
                        <div className="login-form">
                            <h2>Войти</h2>
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
                                {error && <div className="error-message">{error}</div>}
                                <div className="forgot-password">
                                    <a href="/forgot-password">забыли пароль?</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <section className="events-section">
                <div className="events-container">
                    <h2 className="events-title">Актуальные события</h2>
                    <div className="events-grid">
                        {eventsLoading ? (
                            <div className="events-loading">Загрузка событий...</div>
                        ) : events.length > 0 ? (
                            events.map(event => (
                                <div key={event.id} className="event-card">
                                    <div className="event-header">
                                        <span className="event-type">{event.type}</span>
                                        <span className={`event-status ${
                                            event.status === "Регистрация открыта" ? "status-open" : "status-soon"
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <h3 className="event-title">{event.title}</h3>
                                    <div className="event-info">
                                        <div className="event-detail">
                                            <span className="detail-label">Дата:</span>
                                            <span className="detail-value">{event.date}</span>
                                        </div>
                                        <div className="event-detail">
                                            <span className="detail-label">Место:</span>
                                            <span className="detail-value">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-events">Нет актуальных событий</div>
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
        </div>
    );
}

export default MainLanding; 