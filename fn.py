def event_to_dict(event):
    try:
        date_start = event.date_start.strftime('%Y-%m-%d') if event.date_start else None
        date_end = event.date_end.strftime('%Y-%m-%d') if event.date_end else None
        
        result = {
            'id': event.event_id,
            'title': event.title,
            'sport': event.sport,
            'date_start': date_start,
            'date_end': date_end,
            'place': event.place
        }
        print("Преобразованное событие:", result)
        return result
    except Exception as e:
        print(f"Ошибка при преобразовании события: {e}")
        return None