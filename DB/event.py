from datetime import datetime
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.orm import sessionmaker

from DB.models.event import Events
from DB.DataBase import SessionMaker


class Event:
    def __init__(
        self,
        event_id: int | None = None,
        sport: str | None = None,
        title: str | None = None,
        participants: str | None = None,
        participants_num: int | None = None,
        discipline: str | None = None,
        place: str | None = None,
        date_start: datetime | None = None,
        date_end: datetime | None = None,
        gender: list[str] | None = None,
    ):
        self.sessionmaker: sessionmaker = SessionMaker().session_factory

        self.event_id: int | None = event_id
        self.sport: str | None = sport

        self.title: str | None = title
        self.participants: str = participants
        self.participants_num: int | None = participants_num
        self.discipline: str | None = discipline
        self.place: str | None = place

        self.date_start: datetime | None = date_start
        self.date_end: datetime | None = date_end

        self.gender: list[str] = gender if gender is not None else []

        self.created_at: datetime | None = None
        self.updated_at: datetime | None = None

    def get_all(self) -> list[Events]:
        try:
            with self.sessionmaker() as session:
                query = select(Events)
                events: list[Events] = session.scalars(query).all()

                if events is None:
                    raise Exception("Events table is empty")

                return events
        except Exception as e:
            print(e)
            raise e

    def create(self):
        try:
            with self.sessionmaker() as session:
                event: Events = Events(**self.get_self())
                session.add(event)
                session.commit()

                return event

        except Exception as e:
            print(e)
            raise e

    def get_disciplines(self, sport: str):
        try:
            with self.sessionmaker() as session:
                query = select(Events.discipline).distinct().where(Events.sport == sport)
                disciplines = session.scalars(query).all()
                if disciplines is None:
                    raise Exception("Can't find disciplines by sport")

                for discipline in disciplines:
                    if len(discipline) == 0:
                        disciplines.remove(discipline)

                return disciplines
        except Exception as e:
            print(e)
            raise e

    def get_sports_with_disciplines(self):
        try:
            with self.sessionmaker() as session:
                query = select(Events.sport).distinct().order_by(Events.sport)
                sports = session.scalars(query).all()
                if sports is None:
                    raise Exception("Can't find sports")

                sports_disciplines = []
                for sport in sports:
                    sports_disciplines.append(
                        {
                            "sport": sport,
                            "disciplines": self.get_disciplines(sport),
                        }
                    )

                return sports_disciplines
        except Exception as e:
            print(e)
            raise e

    def get_disciplines_by_sport(self, sport: str) -> list[str]:
        try:
            with self.sessionmaker() as session:
                query = select(Events.discipline).distinct().where(Events.sport == sport)
                disciplines = session.scalars(query).all()
                if disciplines is None:
                    raise Exception("Can't find disciplines by sport")

                return disciplines

        except Exception as e:
            print(e)
            raise e

    def get_by_filters(self):
        try:
            with self.sessionmaker() as session:
                query = select(Events)
                filters = self.get_filters()
                if filters:
                    query = query.filter_by(**filters)

                if self.date_start is not None:
                    query = query.filter(Events.date_start >= self.date_start)
                if self.date_end is not None:
                    query = query.filter(Events.date_end <= self.date_end)

                events: list[Events] = session.scalars(query).all()
                if events is None:
                    return []

                return events

        except Exception as e:
            print(e)
            raise e

    def get_by_id(self, event_id: int):
        try:
            with self.sessionmaker() as session:
                query = select(Events).filter_by(event_id=event_id)
                event = session.scalar(query)
                if event is None:
                    raise Exception("Event not found")

                return event
        except Exception as e:
            print(e)
            raise e

    def drop_table(self):
        try:
            with self.sessionmaker() as session:
                session.query(Events).delete()
                session.commit()
        except Exception as e:
            print(e)
            raise e

    def filter_by_time(self, events: list[Events]) -> list[Events]:
        filtered_events = [
            event
            for event in events
            if (event.date_start >= self.date_start and event.date_end <= self.date_end)
        ]
        return filtered_events

    def get_filters(self) -> dict:
        res = {}
        if self.sport is not None and self.sport != "":
            res["sport"] = self.sport

        if self.discipline is not None and self.discipline != "":
            res["discipline"] = self.discipline

        return res

    def get_self(self) -> dict:
        res = {
            "event_id": self.event_id,
            "sport": self.sport,
            "title": self.title,
            "participants": self.participants,
            "participants_num": self.participants_num,
            "discipline": self.discipline,
            "place": self.place,
            "date_start": self.date_start,
            "date_end": self.date_end,
        }

        if self.gender is not None:
            res["gender"] = self.gender

        return res

    def get_sports(self):
        try:
            with self.sessionmaker() as session:
                query = select(Events.sport).distinct().order_by(Events.sport)
                sports = session.scalars(query).all()
                if sports is None:
                    raise Exception("Can't find sports")
                return sports
        except Exception as e:
            print(e)
            raise e

    def get_all_events_ids(self) -> list[int]:
        try:
            with self.sessionmaker() as session:
                query = select(Events.event_id)
                events_ids = session.scalars(query).all()
                return events_ids
        except Exception as e:
            print(e)
            raise e

    def get_by_event_id(self, event_id: int):
        try:
            with self.sessionmaker() as session:
                query = select(Events).filter_by(event_id=event_id)
                event = session.scalar(query)
                if event is None:
                    return None

                return event
        except Exception as e:
            print(e)
            raise e

    def get_random_events(self, limit: int = 10) -> list[Events]:
        try:
            with self.sessionmaker() as session:
                query = select(Events).order_by(func.random()).limit(limit)
                events: list[Events] = session.scalars(query).all()

                if events is None:
                    raise Exception("Events table is empty")

                return events
        except Exception as e:
            print(e)
            raise e

    def get_events_by_date(self, selected_date):
        """
        Получает все события, которые проходят в указанную дату
        (где date_start <= selected_date <= date_end)

        Args:
            selected_date (datetime): Дата для фильтрации

        Returns:
            list[Events]: Список событий, проходящих в указанную дату
        """
        try:
            with self.sessionmaker() as session:
                query = select(Events).where(
                    and_(Events.date_start <= selected_date, Events.date_end >= selected_date)
                )

                events: list[Events] = session.scalars(query).all()
                return events

        except Exception as e:
            print(f"Error in get_events_by_date: {e}")
            return []
        
    @staticmethod
    def event_to_dict(event) -> dict | None:
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
            return result
        except Exception as e:
            print(f"Ошибка при преобразовании события: {e}")
            return None