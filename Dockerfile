# Этап сборки
FROM node:18-alpine as build

WORKDIR /app

# Сначала копируем только package.json и package-lock.json из корректной директории
COPY app/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы приложения из директории app/
COPY app/src ./src
COPY app/public ./public

# Собираем приложение
RUN npm run build

# Этап запуска
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
