import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>Email: info@sportevents.ru</p>
          <p>Телефон: +7 (999) 123-45-67</p>
        </div>
        <div className="footer-section">
          <h4>Социальные сети</h4>
          <div className="social-links">
            <a href="#vk">ВКонтакте</a>
            <a href="#telegram">Telegram</a>
          </div>
        </div>
        <div className="footer-section">
          <h4>О нас</h4>
          <p>Календарь спортивных событий России</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Спортивные события. Все права защищены.</p>
      </div>
    </footer>
  );
}

export default Footer; 