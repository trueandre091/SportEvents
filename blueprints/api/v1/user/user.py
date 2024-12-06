from flask import Blueprint, request
from DB.user import User
from blueprints.api.v1.responses import get_200, get_404
from blueprints.jwt_guard import jwt_guard

user = Blueprint("user", __name__)

@user.post("/profile")
@jwt_guard
def get_user():
    try:
        # Получаем email из JWT payload
        email = request.jwt_payload.get('email')
        if not email:
            return get_404("Email not found in token")
            
        # Ищем пользователя по email
        user: User = User(email=email)
        if user.get() is None:
            return get_404("User not found")
            
        # Возвращаем данные пользователя
        return get_200({
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "tg_id": user.tg_id,
            "role": user.role.value if user.role else None,
            "region": user.region.value if user.region else None,
        })
    except Exception as e:
        return get_404(str(e))