import os

IS_PROD = bool(int(os.environ.get("IS_PROD", 0)))

class DataBaseConfig:
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASS = os.environ.get("DB_PASS", "tRue091andRe")
    DB_HOST = "db" if IS_PROD else "localhost"
    DB_PORT = int(os.environ.get("DB_PORT", "5432"))
    DB_NAME = os.environ.get("DB_NAME", "hakaton")
    DB_CONN = "psycopg2"
    DB_TYPE = "postgresql"

    @classmethod
    def get_connection_string(cls):
        return f"{cls.DB_TYPE}+{cls.DB_CONN}://{cls.DB_USER}:{cls.DB_PASS}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
