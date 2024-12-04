import React, { useState, useEffect } from 'react';
import './EventStats.css';

function EventStats() {
  const [stats, setStats] = useState({
    total: 0,
    inRussia: 0,
    abroad: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/events/stats', {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Неверный формат ответа от сервера');
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Не удалось загрузить статистику');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.name === 'AbortError') {
          setError('Превышено время ожидания ответа от сервера');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          setError('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        } else {
          setError(error.message || 'Сервер временно недоступен');
        }
        setStats({
          total: '-',
          inRussia: '-',
          abroad: '-'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="stats-wrapper">
      <div className="stats-header">
        <h2>Статистика мероприятий</h2>
        <p>Актуальная информация о спортивных событиях в России и за рубежом</p>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="stats-container">
        <div className={`stat-item ${loading ? 'loading' : ''}`}>
          <h3>Всего мероприятий</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className={`stat-item ${loading ? 'loading' : ''}`}>
          <h3>В России</h3>
          <div className="stat-value">{stats.inRussia}</div>
        </div>
        <div className={`stat-item ${loading ? 'loading' : ''}`}>
          <h3>За рубежом</h3>
          <div className="stat-value">{stats.abroad}</div>
        </div>
      </div>
    </div>
  );
}

export default EventStats; 