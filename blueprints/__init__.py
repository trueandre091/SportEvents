from blueprints.api.v1.auth.auth import auth
from blueprints.api.v1.events.events import events
from blueprints.api.v1.user.user import user

blueprints = [[auth, "/api/auth"], [events, "/api/events"], [user, "/api/user"]]
