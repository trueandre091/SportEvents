from flask import Blueprint, request, session, redirect, url_for, render_template, flash
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

from DB.user import User

auth = Blueprint("auth", __name__)


@auth.route("login", methods=["GET", "POST"])
def login():
    try:
        if request.method == "POST":
            email = request.form.get("email")
            password = request.form.get("password")

            user = User(email=email, auto_add=False).get()

            if user is None or not check_password_hash(user.password, password):
                flash("Неверный email или пароль")
                return render_template("auth/login.html")

            session["user_id"] = user.id
            return redirect(url_for("index.get_index"))

        return render_template("auth/login.html")

    except Exception as e:
        print(e)
        flash("Произошла ошибка при входе")
        return render_template("auth/login.html")


@auth.route("register", methods=["GET", "POST"])
def register():
    try:
        if request.method == "POST":
            tg_id = request.form.get("tg_id")
            email = request.form.get("email")
            password = request.form.get("password")

            if not all([tg_id, email, password]):
                return render_template("auth/register.html", error="Все поля должны быть заполнены")

            hashed_password = generate_password_hash(password)

            existing_user = User(email=email, tg_id=int(tg_id), auto_add=False).get()

            if existing_user is not None:
                session["user_id"] = existing_user.id
                return redirect(url_for("index.get_index"))

            user = User(
                email=email,
                password=hashed_password,
                tg_id=int(tg_id),
                username=request.form.get("username"),
                auto_add=True,
            )

            session["user_id"] = user.id

            if request.form.get("remember_me"):
                session.permanent = True

            return redirect(url_for("index.get_index"))

        return render_template(
            "auth/register.html",
            username=request.args.get("username"),
            tg_id=request.args.get("tg_id"),
        )

    except Exception as e:
        print(e)
        return "Something went wrong"


@auth.route("logout")
def logout():
    try:
        session.clear()
        return redirect(url_for("index.get_index"))
    except Exception:
        return "Something went wrong"


@auth.route("delete")
def delete():
    try:
        user = None
        user_id = session.get("user_id")
        if user_id:
            user: User = User(user_id).get()
            if user is not None:
                user.delete()
                session.pop("user_id", None)

        return redirect(url_for("index.get_index"))

    except Exception:
        return "Something went wrong"


@auth.route("profile")
def profile():
    user_id = session.get("user_id")
    if user_id:
        user = User(user_id).get()
        if user:
            print("User found")
            return render_template("auth/profile.html", user=user, notifications=user.get_notifications())

    print("User not found")
    return redirect(url_for("auth.login"))


@auth.route("/unsubscribe/<notification_id>", methods=["POST"])
def unsubscribe(notification_id):
    try:
        user_id = session.get("user_id")
        if not user_id:
            return redirect(url_for("auth.login"))

        user = User(id=user_id).get()
        if not user:
            return redirect(url_for("auth.login"))

        user.remove_notification(notification_id)
        
        flash("Вы успешно отписались от уведомлений")
        return redirect(url_for("auth.profile"))

    except Exception as e:
        print(f"Error unsubscribing: {e}")
        flash("Произошла ошибка при отписке")
        return redirect(url_for("auth.profile"))
