import os
import sys
import json
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT_DIR)

from flask import Flask, request, jsonify
from flask_cors import CORS
from DB.event import Event
from fn import event_to_dict

app = Flask(__name__)
CORS(app)

app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_MIMETYPE'] = 'application/json;charset=utf-8'

@app.before_request
def log_request_info():
    print('Headers:', dict(request.headers))
    print('Body:', request.get_data())

@app.route('/api/events')
def get_events():
    try:
        sport = request.args.get("sport")
        date_start = request.args.get("date_start")
        date_end = request.args.get("date_end")
        selected_date = request.args.get("date")
        all = request.args.get("all")
        event = Event()

        if selected_date:
            selected_date = datetime.strptime(selected_date, '%Y-%m-%d')
            events = event.get_events_by_date(selected_date)
            events = [event_to_dict(event) for event in events]
        else:
            if date_start:
                date_start = datetime.strptime(date_start, "%Y-%m-%d")
            if date_end:
                date_end = datetime.strptime(date_end, "%Y-%m-%d")
            event = Event(sport=sport if sport else None, date_start=date_start, date_end=date_end)
            events_objects = event.get_by_filters()
            events = []
            for event in events_objects:
                events.append({
                    'event_id': event.event_id,
                    'id': event.event_id,  # для совместимости
                    'title': event.title,
                    'discipline': event.discipline,  # добавляем поле
                    'participants': event.participants,  # добавляем поле
                    'participants_num': event.participants_num,  # добавляем поле
                    'sport': event.sport,
                    'date_start': event.date_start.strftime('%Y-%m-%d') if event.date_start else None,
                    'date_end': event.date_end.strftime('%Y-%m-%d') if event.date_end else None,
                    'place': event.place
                })
        
        return jsonify({'events': events})
    except Exception as e:
        print(f"Error in get_events: {e}")
        return jsonify({'events': [], 'error': str(e)})

@app.route('/api/events/random')
def get_random_events():
    try:
        sports = Event().get_sports()
        random_events = [event_to_dict(event) for event in Event().get_random_events()]
        print("Random events data:", random_events)
        return jsonify(random_events)
    except Exception as e:
        print(f"Error in get_random_events: {e}")
        return jsonify([])

@app.route('/api/events/sports')
def get_sports():
    try:
        sports = Event().get_sports()
        print("Sports:", sports)
        return jsonify(sports)
    except Exception as e:
        print(f"Error getting sports: {e}")
        return jsonify([])

@app.route('/api/test')
def test():
    return jsonify({"message": "API работает!"})

@app.route('/events/<path:subpath>')
def handle_events_routes(subpath):
    print(f"Handling events subpath: {subpath}")
    
    if subpath == 'sports':
        return get_sports()
    elif subpath == 'random':
        return get_random_events()
    else:
        return {"error": "Not Found"}, 404

@app.route('/events')
def handle_events():
    return get_events()

if __name__ == '__main__':
    app.run(debug=True, port=5001) 