import logging

from flask import Blueprint, request
from DB.user import User

from blueprints.api.v1.responses import get_200, get_500
from blueprints.jwt_guard import jwt_guard, check_user, check_admin

user = Blueprint("user", __name__)
logger = logging.getLogger(__name__)


@user.post("/profile")
@jwt_guard
@check_user
def get_user():
    try:
        user: User = request.user
        data = user.get_self()
        data["id"] = user.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in get_user: {e}")
        return get_500("Error in get_user")


@user.post("/create")
@jwt_guard
@check_admin
def create_user():
    try:
        user: User = User(**request.form.to_dict())
        if not user.add():
            return get_500("Error in create_user")

        data = user.get_self()
        data["id"] = user.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in create_user: {e}")
        return get_500("Error in create_user")


@user.post("/update")
@jwt_guard
@check_user
def update_user():
    try:
        user: User = User(**request.form.to_dict())
        if not user.update():
            return get_500("Error in update_user")

        data = user.get_self()
        data["id"] = user.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in update_user: {e}")
        return get_500("Error in update_user")
