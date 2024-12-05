from datetime import datetime, timedelta, timezone
import uuid
import jwt
import os
from dotenv import load_dotenv

from sqlalchemy import select, func
from sqlalchemy.orm import sessionmaker

from DB.DataBase import SessionMaker

from DB.models.user import Users

load_dotenv()

class User:
    def __init__(
        self,
        id: str | None = None,
        token: str | None = None,
        email: str = None,
        password: str = None,
        tg_id: int = None,
        username: str = None,
        notifications: list[dict | None] = None,
        auto_add: bool = True,
    ):
        self.sessionmaker: sessionmaker = SessionMaker().session_factory

        self.id: str | None = id
        self.token: str | None = token
        self.email: str = email
        self.password: str = password

        self.tg_id: int = tg_id
        self.username: str = username

        self.notifications: list = notifications if notifications is not None else []

        self.auto_add: bool = auto_add

        self.created_at: datetime | None = None
        self.updated_at: datetime | None = None

        if self.auto_add and self.get() is None:
            self.add()

    def get(self):
        try:
            with self.sessionmaker() as session:
                query = select(Users).filter_by(**self.get_filter_by())
                user: Users = session.scalar(query)
                if user is None:
                    return

                self.id = user.id
                self.email = user.email
                self.password = user.password
                self.token = user.token
                self.tg_id = user.tg_id
                self.username = user.username

                self.notifications = user.notifications

                self.created_at = user.created_at
                self.updated_at = user.updated_at

                return self
        except Exception as e:
            print(e)
            raise e

    def add(self):
        try:
            with self.sessionmaker() as session:
                user: Users = Users(**self.get_self())
                session.add(user)
                session.commit()

                return self

        except Exception as e:
            print(e)
            raise e

    def update(self):
        try:
            with self.sessionmaker() as session:
                session.query(self.model).filter_by(**self.get_filter_by()).update(self.get_self())
                session.commit()

            return self
        except Exception as e:
            print(e)
            raise e

    def delete(self):
        try:
            with self.sessionmaker() as session:
                query = select(Users).filter_by(**self.get_filter_by())
                user: Users = session.scalar(query)
                if user is None:
                    raise Exception("Can't find user for deleting")

                session.delete(user)
                session.commit()
        except Exception as e:
            print(e)
            raise e
        
    def add_notification(self, sport: str, search: str):
        try:
            with self.sessionmaker() as session:
                user = session.query(Users).filter_by(**self.get_filter_by()).first()
                if not user:
                    raise ValueError("User not found")
                
                current_notifications = user.notifications or []
                
                new_notification = {
                    "id": str(uuid.uuid4()),
                    "sport": sport,
                    "search": search
                }
                
                new_notifications = current_notifications + [new_notification]
                
                session.query(Users).filter_by(**self.get_filter_by()).update({
                    "notifications": new_notifications
                }, synchronize_session=False)
                
                session.commit()
                
                self.notifications = new_notifications
                
                return new_notifications
                
        except Exception as e:
            print(f"Error adding notification: {e}")
            raise e
        
    def get_notifications(self):
        try:
            with self.sessionmaker() as session:
                user = session.query(Users).filter_by(**self.get_filter_by()).first()
                if not user:
                    raise ValueError("User not found")
                
                return user.notifications
        except Exception as e:
            print(f"Error getting notifications: {e}")
            raise e

    def get_filter_by(self) -> dict:
        res = {}
        if self.id is not None:
            res["id"] = self.id

        if self.email is not None:
            res["email"] = self.email

        if self.tg_id is not None:
            res["tg_id"] = self.tg_id

        return res

    def get_self(self) -> dict:
        return {
            "token": self.token,
            "email": self.email,
            "password": self.password,
            "tg_id": self.tg_id,
            "username": self.username,
            "notifications": self.notifications,
        }
    
    def get_self_api(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "username": self.username,
            "tg_id": self.tg_id,
        }
    
    def login(self) -> dict:
        data = self.get_self_api()
        data["expired_at"] = int((datetime.now(timezone.utc) + timedelta(days=7)).timestamp())
        self.token = jwt.encode(data, key=os.environ.get("JWT_SECRET"), algorithm="HS256")
        return {
            "token": self.token,
            "user": self.get_self_api()
        }

    def remove_notification(self, notification_id: str):
        try:
            with self.sessionmaker() as session:
                user = session.query(Users).filter_by(**self.get_filter_by()).first()
                if not user:
                    raise ValueError("User not found")
                
                current_notifications = user.notifications or []
                
                new_notifications = [
                    notif for notif in current_notifications 
                    if notif.get('id') != notification_id
                ]
                
                if len(current_notifications) == len(new_notifications):
                    raise ValueError(f"Notification with id {notification_id} not found")
                
                session.query(Users).filter_by(**self.get_filter_by()).update({
                    "notifications": new_notifications
                }, synchronize_session=False)
                
                session.commit()
                
                self.notifications = new_notifications
                
                return True
                
        except Exception as e:
            print(f"Error removing notification: {e}")
            raise e

    def get_users_with_notifications(self):
        try:
            with self.sessionmaker() as session:
                query = select(Users).filter(
                    Users.notifications.is_not(None),
                    func.jsonb_array_length(Users.notifications) > 0
                )
                users = session.scalars(query).all()
                if users is None:
                    raise Exception("Users not found")
                return users
        except Exception as e:
            print(f"Error getting users with notifications: {e}")
            raise e

    def create_token(self, user_id: uuid.UUID, expires_delta: timedelta = None) -> str:
        """Создает JWT токен для пользователя"""
        if expires_delta is None:
            expires_delta = timedelta(hours=24)  # По умолчанию токен действителен 24 часа
        
        exp = datetime.utcnow() + expires_delta
        
        payload = {
            'user_id': str(user_id),  # Преобразуем UUID в строку
            'exp': int(exp.timestamp())
        }
        
        token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
        return token

    def verify_token(self, token: str) -> dict | None:
        """Проверяет JWT токен и возвращает payload если токен валиден"""
        try:
            # PyJWT автоматически проверит поле exp
            payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
            # Преобразуем строку обратно в UUID
            if 'user_id' in payload:
                payload['user_id'] = uuid.UUID(payload['user_id'])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Токен истек")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Недействительный токен: {e}")
            return None

