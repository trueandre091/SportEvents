# Этап сборки фронтенда
FROM node:20 AS frontend-build
WORKDIR /frontend
COPY app/package*.json ./
RUN npm install
COPY app/src ./src
COPY app/public ./public
RUN npm run build

# Этап основного приложения
FROM python:3.12
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV IS_PROD=1

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    python3-dev \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    chromium \
    chromium-driver \
    wait-for-it \
    && rm -rf /var/lib/apt/lists/*

# Настройка Chrome для парсинга
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver
RUN chmod +x /usr/bin/chromedriver

# Установка Python зависимостей
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Копирование всех файлов проекта
COPY . .
COPY --from=frontend-build /frontend/build ./app/static

EXPOSE 5000

# Создаем скрипт для запуска всех сервисов
RUN echo '#!/bin/bash\n\
# Ждем готовности базы данных\n\
wait-for-it db:5432 -t 60\n\
# Применяем миграции\n\
alembic upgrade head\n\
# Запускаем все сервисы\n\
python bot_start.py &\n\
python parsing_start.py &\n\
python main.py' > /app/start.sh

RUN chmod +x /app/start.sh

# Запуск всех сервисов
CMD ["/app/start.sh"]
