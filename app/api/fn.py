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