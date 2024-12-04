import os
from dotenv import load_dotenv

from DB.config import DataBaseConfig

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class SessionMaker(DataBaseConfig, metaclass=Singleton):
    """Basic class which make sessions"""

    def __init__(self, echo: bool = False):
        self.echo = echo
        self.engine = create_engine(
            f"{self.DB_TYPE}+"
            f"{self.DB_CONN}://"
            f"{self.DB_USER}:"
            f"{self.DB_PASS}@"
            f"{self.DB_HOST}:"
            f"{self.DB_PORT}/"
            f"{self.DB_NAME}",
            echo=echo,
        )
        self.session_factory = sessionmaker(self.engine, expire_on_commit=False)
