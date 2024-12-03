# Этап сборки фронтенда
FROM node:20 AS frontend-build
WORKDIR /frontend

# Очищаем кэш npm
RUN npm cache clean --force

COPY app/package*.json ./
RUN npm install

# Копируем все файлы React приложения
COPY app/src ./src
COPY app/public ./public
COPY app/.env* ./

# Принудительная пересборка
RUN npm run build

# Этап основного приложения
FROM python:3.12
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV IS_PROD=1
ENV PYTHONPATH=/app

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
    dos2unix \
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
COPY alembic.ini .
COPY migrations ./migrations
COPY DB ./DB
COPY bot ./bot
COPY parsing ./parsing
COPY common ./common
COPY utils ./utils
COPY blueprints ./blueprints
COPY *.py ./
COPY app ./app
COPY .env ./

# Конвертируем переносы строк
RUN dos2unix /app/.env

# Создаем директорию для статических файлов и копируем собранные файлы React
RUN mkdir -p /app/static
WORKDIR /app/static
COPY --from=frontend-build /frontend/build/static/css ./css
COPY --from=frontend-build /frontend/build/static/js ./js
COPY --from=frontend-build /frontend/build/static/media ./media
COPY --from=frontend-build /frontend/build/asset-manifest.json .
COPY --from=frontend-build /frontend/build/index.html .
COPY --from=frontend-build /frontend/build/manifest.json .
WORKDIR /app

EXPOSE 5001

# Создаем скрипт для запуска всех сервисов
RUN echo '#!/bin/bash\n\
# Загружаем переменные окружения\n\
set -a\n\
source /app/.env\n\
set +a\n\
# Ждем готовности базы данных\n\
wait-for-it db:5432 -t 60\n\
# Применяем миграции\n\
alembic upgrade head\n\
# Запускаем все сервисы\n\
cd /app && \
python bot_start.py &\n\
python parsing_start.py &\n\
python main.py --port 5001' > /app/start.sh

RUN chmod +x /app/start.sh
RUN dos2unix /app/start.sh

# Запуск всех сервисов
CMD ["/app/start.sh"]
