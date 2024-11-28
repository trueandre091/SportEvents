from flask import Blueprint, request, render_template, session, redirect, url_for, flash
from common import *
from DB.user import User
from DB.event import Event
from datetime import datetime

index = Blueprint("index", __name__)


def event_to_dict(event):
    return {
        'id': event.id,
        'event_id': event.event_id,
        'title': event.title,
        'sport': event.sport,
        'date_start': event.date_start.strftime('%Y-%m-%d'),
        'date_end': event.date_end.strftime('%Y-%m-%d'),
        'place': event.place,
        'discipline': event.discipline,
        'participants': event.participants,
        'participants_num': event.participants_num,
    }



@index.get("")
def get_index():
    try:
        user = None
        sports = Event().get_sports()
        random_events = [event_to_dict(event) for event in Event().get_random_events()]

        for k, v in session.items():
            print(k, v)

        user_id = session.get("user_id")
        if user_id:
            user = User(id=user_id, auto_add=False).get()
            if user is None:
                session.pop("user_id", None)

        return render_template(
            "main/index.html", user=user, sports=sports, random_events=random_events
        )

    except Exception as e:
        print(f"Index error: {e}")
        return "Something went wrong"


@index.get("/events")
def get_events():
    try:
        sport = request.args.get("sport")
        date_start = request.args.get("date_start")
        date_end = request.args.get("date_end")
        selected_date = request.args.get("date")
        all = request.args.get("all")
        event = Event()

        if selected_date:
            # Если указана конкретная дата, используем новую функцию
            selected_date = datetime.strptime(selected_date, '%Y-%m-%d')
            events = event.get_events_by_date(selected_date)
        else:
            # Иначе используем существующую фильтрацию
            if date_start:
                date_start = datetime.strptime(date_start, "%Y-%m-%d")
            if date_end:
                date_end = datetime.strptime(date_end, "%Y-%m-%d")
            event = Event(sport=sport if sport else None, date_start=date_start, date_end=date_end)
            events = event.get_by_filters()

        return render_template("main/events.html", events=events, selected_date=selected_date, sport=sport, all=all)

    except Exception as e:
        print(e)
        return "Something went wrong"


@index.get("/events/<int:event_id>")
def get_event_details(event_id):
    try:
        event = Event().get_by_id(event_id)
        return render_template("main/event_details.html", event=event)
    except Exception as e:
        print(f"Error getting event details: {e}")
        return "Something went wrong"
    

@index.get("/add_notification")
def add_notification():
    try:
        user_id = session.get("user_id")
        if user_id:
            user = User(id=user_id, auto_add=False).get()

            if user is None:
                session.pop("user_id", None)
                return redirect(url_for("auth.login"))

            user.add_notification(sport=request.args.get("sport"), search=request.args.get("search"))

            flash("Уведомление добавлено")
            return redirect(request.referrer or url_for('index.get_index'))

        else:
            return redirect(url_for("auth.login"))
        
    except Exception as e:
        print(e)
        return "Something went wrong"
