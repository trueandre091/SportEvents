import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import './MainLanding.css';
import FSPLogo from './FSPLogo';

function MainLanding() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Выносим тестовые данные в useMemo
    const testEvents = useMemo(() => [
        {
            id: "1",
            sport: "Самбо",
            title: "Чемпионат России по самбо 2024",
            description: "Главное событие года в мире российского самбо. Сильнейшие спортсмены страны соберутся, чтобы определить чемпионов в различных весовых категориях.",
            participants: "Сборные регионов России",
            participants_num: 250,
            discipline: "Спортивное самбо",
            region: "Москва",
            representative: "Иванов И.И.",
            files: [],
            place: "ДС Лужни��и",
            date_start: "2024-03-15",
            date_end: "2024-03-20",
            status: "Регистрация открыта"
        },
        {
            id: "2",
            sport: "Дзюдо",
            title: "Кубок России по дзюдо",
            description: "Традиционный турнир по дзюдо среди сильнейших спортсменов страны. Отборочные соревнования к международным стартам.",
            participants: "Спортсмены регионов РФ",
            participants_num: 180,
            discipline: "Дзюдо",
            region: "Санкт-Петербург",
            representative: "Петров П.П.",
            files: [],
            place: "СК Юбилейный",
            date_start: "2024-04-05",
            date_end: "2024-04-08",
            status: "Анонс"
        },
        {
            id: "3",
            sport: "Бокс",
            title: "Первенство России по боксу среди юниоров",
            description: "Соревнования среди молодых боксеров определят будущих звезд российского бокса. Важный этап в развитии спортсменов.",
            participants: "Юниоры 17-18 лет",
            participants_num: 320,
            discipline: "Бокс",
            region: "Казань",
            representative: "Сидоров С.С.",
            files: [],
            place: "Баскет-холл",
            date_start: "2024-05-10",
            date_end: "2024-05-15",
            status: "Скоро открытие регистрации"
        }
    ], []);

    // Выносим функцию fetchEvents в useCallback
    const fetchEvents = useCallback(async () => {
        try {
            const data = await eventService.getCurrentEvents();
            setEvents(data);
        } catch (error) {
            console.error('Ошибка при загрузке событий:', error);
            if (error.response?.status === 404 || error.message.includes('404') || error.message.includes('failed to fetch')) {
                console.log('Используем тестовые данные');
                setEvents(testEvents);
                setError(null);
            } else {
                setError('Не удалось загрузить события');
            }
        } finally {
            setLoading(false);
        }
    }, [testEvents]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Выносим функцию форматирования даты в useCallback
    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, []);

    return (
        <div className="landing-page">
            <header className="landing-header">
                <nav className="landing-nav">
                    <div className="logo">
                        <FSPLogo />
                    </div>
                    <div>
                        <button 
                            className="nav-button"
                            onClick={() => navigate('/login')}
                        >
                            Войти
                        </button>
                        <button 
                            className="nav-button register"
                            onClick={() => navigate('/register')}
                        >
                            Регистрация
                        </button>
                    </div>
                </nav>
            </header>

            <main className="landing-main">
                <div className="content-wrapper">
                    <section className="hero-section">
                        <div className="text-content">
                            <h1>Цифровые технологии в спорте</h1>
                            <p className="subtitle">
                                Мы создаем инновационные решения для развития спорта и помогаем
                                спортсменам достигать новых высот с помощью современных технологий
                            </p>
                            <button 
                                className="cta-button"
                                onClick={() => navigate('/sportevents')}
                            >
                                Смотреть события
                            </button>
                        </div>
                    </section>

                    <section className="events-section">
                        <h2>Актуальные события</h2>
                        {loading ? (
                            <div className="events-loading">Загрузка событий...</div>
                        ) : error ? (
                            <div className="events-error">{error}</div>
                        ) : (
                            <div className="events-grid">
                                {events.map((event, index) => (
                                    <div 
                                        key={event.id} 
                                        className="event-card"
                                        style={{"--index": index}}
                                    >
                                        <div className="event-header">
                                            <span className="event-sport">{event.sport}</span>
                                            <span className="event-status">{event.status}</span>
                                        </div>
                                        <h3 className="event-title">{event.title}</h3>
                                        <p className="event-description">{event.description}</p>
                                        <div className="event-details">
                                            <div className="event-detail">
                                                <span className="detail-label">Место</span>
                                                <span className="detail-value">{event.place}</span>
                                            </div>
                                            <div className="event-detail">
                                                <span className="detail-label">Регион</span>
                                                <span className="detail-value">{event.region}</span>
                                            </div>
                                            <div className="event-detail">
                                                <span className="detail-label">Участники</span>
                                                <span className="detail-value">{event.participants_num}</span>
                                            </div>
                                            <div className="event-dates">
                                                <div>
                                                    <span className="date-label">Начало</span>
                                                    <div className="date-value">{formatDate(event.date_start)}</div>
                                                </div>
                                                <div>
                                                    <span className="date-label">Окончание</span>
                                                    <div className="date-value">{formatDate(event.date_end)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default MainLanding; 