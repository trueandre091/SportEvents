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


class SessionMaker(metaclass=Singleton):
    """Basic class which make sessions"""

    def __init__(self, echo: bool = True):
        self.echo = echo
        self.engine = create_engine(
            DataBaseConfig.get_connection_string(),
            echo=echo,
        )
        self.session_factory = sessionmaker(self.engine, expire_on_commit=False)
