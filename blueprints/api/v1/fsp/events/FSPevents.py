import logging
import json
from datetime import datetime

from flask import Blueprint, request

from DB.FSPevent import FSPevent
from DB.FSPevent_archive import FSPevent_archive
from DB.models.user_roles import UserRoles
from blueprints.api.v1.responses import get_200, get_400, get_404, get_500
from blueprints.jwt_guard import jwt_guard, check_admin

fsp_events = Blueprint("fsp_events", __name__)
logger = logging.getLogger(__name__)


@fsp_events.route("/events", methods=["POST"])
def api_get_fsp_events():
    try:
        archive = bool(request.form.get("archive"))
        date_start = request.form.get("date_start")
        date_end = request.form.get("date_end")
        discipline = request.form.get("discipline")
        status = request.form.get("status")

        if date_start:
            date_start = datetime.strptime(date_start, "%Y-%m-%d")
        if date_end:
            date_end = datetime.strptime(date_end, "%Y-%m-%d")

        if archive:
            event = FSPevent_archive(date_start=date_start, date_end=date_end, discipline=discipline)
        else:
            event = FSPevent(date_start=date_start, date_end=date_end, discipline=discipline, status=status)

        events = event.get_by_filters()
        res = []
        for event in events:
            data = event.get_self()
            data["id"] = event.id
            res.append(data)

        return get_200(res)
    except Exception as e:
        logger.error(f"Error in api_get_fsp_events: {e}")
        return get_500("Error in api_get_fsp_events")


@fsp_events.post("/events/add")
@jwt_guard
@check_admin
def api_add_fsp_event():
    try:
        event_data = request.form.to_dict()
        event_data["files"] = json.loads(event_data["files"])
        event: FSPevent = FSPevent(**event_data)
        user = request.user
        if event.region is None:
            return get_400("Region is required")

        if user.role == UserRoles.REGIONAL_ADMIN and user.region != event.region:
            return get_400("You don't have permission to add event in this region")

        event.add()

        data = event.get_self()
        data["id"] = event.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in api_add_fsp_event: {e}")
        return get_500("Error in api_add_fsp_event")


@fsp_events.post("/events/update")
@jwt_guard
@check_admin
def api_update_fsp_event():
    try:
        event_data = request.form.to_dict()
        event_data["files"] = json.loads(event_data["files"])
        event: FSPevent = FSPevent(**event_data)
        user = request.user
        if user.role == UserRoles.REGIONAL_ADMIN and user.region != event.region:
            return get_400("You don't have permission to update event in this region")

        if event.id is None:
            return get_400("Event id is required")

        if not event.update():
            return get_500("Error in update")

        data = event.get_self()
        data["id"] = event.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in api_update_fsp_event: {e}")
        return get_500("Error in api_update_fsp_event")


@fsp_events.post("/events/archive")
@jwt_guard
@check_admin
def api_archive_fsp_event():
    try:
        event_id = request.form.get("id")
        user = request.user
        if not event_id:
            return get_400("Event id is required")

        event: FSPevent = FSPevent(id=event_id)
        if not event.get():
            return get_404("Event not found")

        if user.role == UserRoles.REGIONAL_ADMIN and user.region != event.region:
            return get_400("You don't have permission to archive event in this region")

        archive_event = FSPevent_archive(**event.get_self())

        if not archive_event.add():
            return get_500("Error in archive event")

        event.delete()

        data = archive_event.get_self()
        data["id"] = archive_event.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in api_archive_fsp_event: {e}")
        return get_500("Error in api_archive_fsp_event")


@fsp_events.post("/events/restore")
@jwt_guard
@check_admin
def api_restore_fsp_event():
    try:
        event_id = request.form.get("id")
        user = request.user
        if not event_id:
            return get_400("Event id is required")

        archive_event: FSPevent_archive = FSPevent_archive(id=event_id)
        if not archive_event.get():
            return get_404("Archive event not found")
        
        if user.role == UserRoles.REGIONAL_ADMIN and user.region != archive_event.region:
            return get_400("You don't have permission to restore event in this region")

        event = FSPevent(**archive_event.get_self())
        
        if not event.add():
            return get_500("Error in restore event")

        archive_event.delete()

        data = event.get_self()
        data["id"] = event.id

        return get_200(data)
    except Exception as e:
        logger.error(f"Error in api_restore_fsp_event: {e}")
        return get_500("Error in api_restore_fsp_event")
