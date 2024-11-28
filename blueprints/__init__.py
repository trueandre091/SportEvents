from blueprints.auth.auth import auth
from blueprints.main.index import index

blueprints = [[auth, "/auth"], [index, "/"]]
