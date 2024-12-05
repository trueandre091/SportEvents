from blueprints.api.v1.auth.auth import auth
from blueprints.api.v1.events.events import events

blueprints = [[auth, "/api/auth"], [events, "/api/events"]]
