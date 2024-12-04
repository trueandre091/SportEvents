import logging

from flask import Blueprint, request, jsonify
from datetime import datetime

from DB.event import Event

api = Blueprint("api", __name__)
logger = logging.getLogger(__name__)


@api.post("/events")
def api_get_events():
    try:
        sport = request.form.get("sport")
        date_start = request.form.get("date_start")
        date_end = request.form.get("date_end")
        selected_date = request.form.get("selected_date")
        if selected_date:
            selected_date = datetime.strptime(selected_date, '%Y-%m-%d')
            events_objects = Event().get_events_by_date(selected_date)
        else:
            if date_start:
                date_start = datetime.strptime(date_start, "%Y-%m-%d")
            if date_end:
                date_end = datetime.strptime(date_end, "%Y-%m-%d")
            event = Event(sport=sport, date_start=date_start, date_end=date_end)
            events_objects = event.get_by_filters()
        events = []
        for event in events_objects:
            events.append({
                'event_id': event.event_id,
                'title': event.title,
                'discipline': event.discipline,
                'participants': event.participants,
                'participants_num': event.participants_num,
                'sport': event.sport,
                'date_start': event.date_start.strftime('%Y-%m-%d') if event.date_start else None,
                'date_end': event.date_end.strftime('%Y-%m-%d') if event.date_end else None,
                'place': event.place
            })

        return jsonify(events)
    except Exception as e:
        logger.error(f"Error in get_events: {e}")
        return jsonify([]), 500


@api.post("/events/random")
def api_get_random_events():
    try:
        event_manager: Event = Event()
        random_events = [event_manager.event_to_dict(event) for event in event_manager.get_random_events()]

        return jsonify(random_events)
    except Exception as e:
        logger.error(f"Error in get_random_events: {e}")
        return jsonify([]), 500
    

@api.post("/events/sports")
def api_get_sports():
    try:
        sports = Event().get_sports()
        return jsonify(sports)
    except Exception as e:
        logger.error(f"Error in get_sports: {e}")
        return jsonify([]), 500
