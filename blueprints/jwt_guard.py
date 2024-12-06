from functools import wraps
from flask import request, jsonify
import jwt
import os
from datetime import datetime, timezone

def jwt_guard(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            
            # Проверяем срок действия
            if 'expired_at' in payload:
                exp_timestamp = payload['expired_at']
                if datetime.fromtimestamp(exp_timestamp, tz=timezone.utc) < datetime.now(timezone.utc):
                    return jsonify({'error': 'Token has expired'}), 401
            
            # Сохраняем payload в request
            request.jwt_payload = payload
            return func(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
    return wrapper


