from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

load_dotenv()

celery = Celery(
    'sport_events',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    include=['celery_app.tasks']
)

celery.conf.update(
    result_expires=3600,
    timezone='UTC',
    enable_utc=True,
)

# Настройка периодических задач
celery.conf.beat_schedule = {
    'update-events-daily': {
        'task': 'celery_app.tasks.update_events',
        'schedule': crontab(hour=3, minute=0),  # Каждый день в 3:00 UTC
    },
    'check-upcoming-events': {
        'task': 'celery_app.tasks.check_upcoming_events',
        'schedule': crontab(minute='*/15'),  # Каждые 15 минут
    },
}

if __name__ == '__main__':
    celery.start() 