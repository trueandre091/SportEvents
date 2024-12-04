from blueprints.auth.auth import auth
from blueprints.main.index import index
from blueprints.api.api import api

blueprints = [[auth, "/auth"], [index, "/"], [api, "/api"]]
