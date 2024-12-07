import logging
import os
from flask import Flask
from blueprints import blueprints
from common import *

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

for blueprint in blueprints:
    app.register_blueprint(blueprint[0], url_prefix=blueprint[1])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
