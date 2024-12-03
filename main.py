import logging
import os
import argparse
from flask import Flask, send_from_directory
from flask_cors import CORS
from datetime import timedelta
from blueprints import blueprints
from common import *

logging.basicConfig(level=logging.INFO)

def create_app():
    app = Flask(__name__,
        static_folder='static',
        static_url_path='/static'
    )
    CORS(app)
    
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_MIMETYPE'] = 'application/json;charset=utf-8'
    app.secret_key = os.environ.get("APP_SECRET")
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(days=14)
    )

    for blueprint in blueprints:
        app.register_blueprint(blueprint[0], url_prefix=blueprint[1])
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path == '':
            return send_from_directory(app.static_folder, 'index.html')
        elif os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')
    
    return app

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5000)
    args = parser.parse_args()
    
    app = create_app()
    app.run(host="0.0.0.0", port=args.port)
