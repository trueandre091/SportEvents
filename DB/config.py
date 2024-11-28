import os
from dotenv import load_dotenv

load_dotenv()
IS_PROD = os.environ.get("IS_PROD") == "1"


class DataBaseConfig:
    DB_USER = "postgres"
    DB_PASS = os.environ.get("DB_PASS")
    DB_HOST = "db-container" if IS_PROD else "localhost"
    DB_PORT = 5432
    DB_NAME = "hakaton"
    DB_CONN = "psycopg2"
    DB_TYPE = "postgresql"
