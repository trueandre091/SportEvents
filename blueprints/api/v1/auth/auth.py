import logging

from flask import Blueprint, request
from werkzeug.security import check_password_hash, generate_password_hash
from DB.user import User

from blueprints.api.v1.responses import get_200, get_400, get_500, get_404

auth = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth.post("/login")
def login():
    try:
        email = request.form.get("email")
        password = request.form.get("password")

        if not email or not password:
            return get_400("Email and password are required")
        
        user: User = User(email=email, auto_add=False)
        if user.get() is None:
            return get_404("User not found")
        
        if not check_password_hash(user.password, password):
            return get_400("Invalid password")
        
        data = user.login()

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return get_500("Login failed")


@auth.post("/register")
def register():
    try:
        email = request.form.get("email")
        password = request.form.get("password")
        username = request.form.get("username")
        tg_id = request.form.get("tg_id")

        if not email or not password:
            return get_400("Email and password are required")
        
        user: User | None = User(email=email, password=generate_password_hash(password), username=username, tg_id=tg_id, auto_add=False)

        if user.get() is not None:
            return get_400("User already exists")
        
        user.add().get()
        data = user.login()

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in register: {e}")
        return get_500("Register failed")
