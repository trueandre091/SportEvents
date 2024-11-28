from functools import wraps
from flask import session, redirect, url_for
from DB.user import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if user_id is None:
            return redirect(url_for("auth.login"))
            
        user = User(id=user_id).get()
        if user is None:
            session.pop("user_id", None)
            return redirect(url_for("auth.login"))
            
        return f(*args, **kwargs)
    return decorated_function 