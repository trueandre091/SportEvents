# Этап сборки
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей из директории app
COPY app/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код из директории app
COPY app/ .

# Собираем приложение
RUN npm run build

# Этап production
FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение из этапа сборки
COPY --from=builder /app/build /usr/share/nginx/html

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
