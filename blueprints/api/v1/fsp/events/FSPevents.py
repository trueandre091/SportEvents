import logging
from datetime import datetime

from flask import Blueprint, request

from DB.FSPevent import FSPevent
from DB.FSPevent_archive import FSPevent_archive

from blueprints.api.v1.responses import get_200, get_500

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

        print(date_start, date_end, discipline, sep="\n")

        if archive:
            event = FSPevent_archive(date_start=date_start, date_end=date_end, discipline=discipline)
        else:
            event = FSPevent(date_start=date_start, date_end=date_end, discipline=discipline, status=status)

        events = event.get_by_filters()
        res = []
        for event in events:
            res.append({
                "id": event.id,
                "sport": event.sport,
                "title": event.title,
                "description": event.description,
                "participants": event.participants,
                "participants_num": event.participants_num,
                "discipline": event.discipline,
                "region": event.region.value if event.region is not None else None,
                "representative": event.representative,
                "files": event.files if len(event.files) > 0 else None,
                "place": event.place,
                "date_start": event.date_start.strftime('%Y-%m-%d') if event.date_start else None,
                "date_end": event.date_end.strftime('%Y-%m-%d') if event.date_end else None,
                "status": event.status.value if event.status is not None else None,
            })

        return get_200(res)
    except Exception as e:
        logger.error(f"Error in api_get_fsp_events: {e}")
        return get_500("Error in api_get_fsp_events")
