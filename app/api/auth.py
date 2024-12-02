from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from DB.user import User

router = Blueprint('auth', __name__)

@router.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User(email=email, auto_add=False).get()

        if user is None or not check_password_hash(user.password, password):
            return jsonify({'message': 'Неверный email или пароль'}), 401

        session['user_id'] = user.id
        return jsonify({'success': True})

    except Exception as e:
        print(e)
        return jsonify({'message': 'Произошла ошибка при входе'}), 401

@router.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        tg_id = data.get('tg_id')
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        remember_me = data.get('remember_me')

        if not all([tg_id, email, password]):
            return jsonify({'error': 'Все поля должны быть заполнены'}), 400

        hashed_password = generate_password_hash(password)

        existing_user = User(email=email, tg_id=int(tg_id), auto_add=False).get()

        if existing_user is not None:
            session['user_id'] = existing_user.id
            return jsonify({'success': True})

        user = User(
            email=email,
            password=hashed_password,
            tg_id=int(tg_id),
            username=username,
            auto_add=True
        )

        session['user_id'] = user.id

        if remember_me:
            session.permanent = True

        return jsonify({'success': True})

    except Exception as e:
        print(e)
        return jsonify({'error': 'Произошла ошибка при регистрации'}), 400 