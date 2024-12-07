from functools import wraps
from flask import request, jsonify
import jwt
import os
from datetime import datetime, timezone

from blueprints.api.v1.responses import get_401, get_403

from DB.user import User
from DB.models.user_roles import UserRoles


def jwt_guard(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return get_401("No token provided")

        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])

            # Проверяем срок действия
            if 'expired_at' in payload:
                exp_timestamp = payload['expired_at']
                if datetime.fromtimestamp(exp_timestamp, tz=timezone.utc) < datetime.now(timezone.utc):
                    return get_401("Token has expired")

            # Сохраняем payload в request
            request.jwt_payload = payload
            return func(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return get_401("Token has expired")
        except jwt.InvalidTokenError:
            return get_401("Invalid token")

    return wrapper


def check_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        email = request.jwt_payload.get('email')
        if not email:
            return get_401("Email not found in token")

        user: User = User(email=email)
        if user.get() is None:
            return get_401("User not found")

        if user.role not in [UserRoles.ADMIN, UserRoles.CENTRAL_ADMIN, UserRoles.REGIONAL_ADMIN]:
            return get_403("Access denied")

        request.user = user

        return func(*args, **kwargs)

    return wrapper


def check_user(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        email = request.jwt_payload.get('email')
        if not email:
            return get_401("Email not found in token")

        user: User = User(email=email)
        if user.get() is None:
            return get_401("User not found")

        request.user = user

        return func(*args, **kwargs)

    return wrapper
