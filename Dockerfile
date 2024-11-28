# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV IS_PROD=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run alembic migrations, start gunicorn and the bot
CMD ["bash", "-c", "alembic upgrade head && python bot_start.py & python main.py"]

# Установка Chrome и необходимых пакетов
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    chromium \
    chromium-driver

# Настройка переменных окружения для Chrome
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Установка прав на ChromeDriver
RUN chmod +x /usr/bin/chromedriver

# Очистка кэша apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
