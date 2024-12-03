from flask import Blueprint

# Создаем blueprint для API
api = Blueprint('api', __name__)

# Список всех blueprints с их префиксами URL
blueprints = [
    (api, '/api')
]

# Импортируем все маршруты после создания blueprint
from app.api import routes 