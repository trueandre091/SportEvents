from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from bot.bot import bot
import logging
import os
from dotenv import load_dotenv
import smtplib
from smtplib import SMTPRecipientsRefused
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

logger = logging.getLogger(__name__)

async def send_event_notification(
    telegram_id: int,
    message: str,
    event_data: dict
) -> bool:
    """
    Отправляет уведомление о событии через Telegram.
    
    Args:
        telegram_id (int): ID пользователя в Telegram
        message (str): Текст сообщения
        event_data (dict): Данные о событии
    
    Returns:
        bool: True если уведомление успешно отправлено
    """
    try:
        # Создаем клавиатуру с кнопкой для перехода к событию
        keyboard = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="Подробнее о событии",
                url=f"{os.getenv('MAIN_URL')}/events/{event_data['id']}"
            )
        ]])

        # Форматируем сообщение с дополнительной информацией
        detailed_message = (
            f"{message}\n\n"
            f"🏆 Вид спорта: {event_data['sport']}\n"
            f"📍 Место проведения: {event_data['place']}\n"
            f"🕒 Начало: {event_data['start_time']}"
        )

        # Отправляем сообщение с клавиатурой
        await bot.send_message(
            chat_id=telegram_id,
            text=detailed_message,
            reply_markup=keyboard
        )
        return True

    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления в Telegram для пользователя {telegram_id}: {e}")
        return False 

async def send_email_notification(
    to_email: str,
    message: str,
    event_data: dict
) -> bool:
    """
    Отправляет уведомление о событии по email через Gmail SMTP.
    
    Args:
        to_email (str): Email получателя
        message (str): Текст сообщения
        event_data (dict): Данные о событии
    
    Returns:
        bool: True если уведомление успешно отправлено
    """
    try:
        # Данные для подключения к Gmail SMTP
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("GMAIL_USER")
        sender_password = os.getenv("GMAIL_APP_PASSWORD")

        # Создаем HTML-версию письма
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>{message}</h2>
                <div style="margin: 20px 0;">
                    <p><strong>🏆 Вид спорта:</strong> {event_data['sport']}</p>
                    <p><strong>📍 Место проведения:</strong> {event_data['place']}</p>
                    <p><strong>🕒 Начало:</strong> {event_data['start_time']}</p>
                </div>
                <div style="margin-top: 30px;">
                    <a href="{os.getenv('MAIN_URL')}/events/{event_data['id']}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px;">
                        Подробнее о событии
                    </a>
                </div>
            </body>
        </html>
        """

        # Создаем сообщение
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Уведомление о спортивном событии"
        msg['From'] = sender_email
        msg['To'] = to_email

        # Добавляем HTML-версию
        msg.attach(MIMEText(html_content, 'html'))

        # Добавляем заголовки для уменьшения вероятности попадания в спам
        msg['List-Unsubscribe'] = f'<{os.getenv("MAIN_URL")}/unsubscribe?email={to_email}>'
        msg.add_header('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click')
        
        # Отправляем письмо
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)

        return True
    
    except SMTPRecipientsRefused as e:
        logger.info(f"Адрес получателя отклонен: {to_email}", e)
        return True

    except Exception as e:
        logger.error(f"Ошибка при отправке email для {to_email}: {e}")
        return False 