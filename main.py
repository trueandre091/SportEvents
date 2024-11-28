import logging
import os
from flask import Flask
from datetime import timedelta
from blueprints import blueprints
from common import *

logging.basicConfig(level=logging.INFO)

app = Flask(__name__,
    template_folder='templates',
    static_folder='static'
)
app.secret_key = os.environ.get("APP_SECRET")
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=14)
)

for blueprint in blueprints:
    app.register_blueprint(blueprint[0], url_prefix=blueprint[1])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
