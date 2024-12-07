from datetime import datetime
from enum import Enum

from sqlalchemy import select, update, delete
from sqlalchemy.orm import sessionmaker

from DB.DataBase import SessionMaker
from DB.models.FSPevent import FSPEvents
from DB.models.regionals import Regions
from DB.models.FSPevent_status import FSPEventStatus


class FSPevent:
    def __init__(
            self,
            id: str | None = None,
            sport: str | None = None,
            title: str | None = None,
            description: str | None = None,
            admin_description: str | None = None,
            participants: str | None = None,
            participants_num: str | None = None,
            discipline: str | None = None,
            region: Regions | None = None,
            representative: str | None = None,
            files: list[dict] | None = None,
            place: str | None = None,
            date_start: datetime | None = None,
            date_end: datetime | None = None,
            status: FSPEventStatus | None = None,
            auto_add: bool = False,
    ):
        self.sessionmaker: sessionmaker = SessionMaker().session_factory

        self.id: str | None = id

        self.sport: str | None = sport
        self.title: str | None = title
        self.description: str | None = description
        self.admin_description: str | None = admin_description

        self.participants: str | None = participants
        self.participants_num: str | None = participants_num
        self.discipline: str | None = discipline
        self.place: str | None = place

        self.region: Regions | None = region
        self.status: FSPEventStatus | None = status
        self.representative: str | None = representative
        self.files: list[dict] | None = files

        self.date_start: datetime | None = date_start
        self.date_end: datetime | None = date_end

        self.auto_add: bool = auto_add

        self.convert_region_to_key()
        self.convert_status_to_key()

        if self.auto_add:
            pass

    def add(self):
        try:
            with self.sessionmaker() as session:
                event: FSPEvents = FSPEvents(**self.get_self())
                session.add(event)
                session.flush()
                self.id = str(event.id)
                session.commit()
                return True
        except Exception as e:
            print(e)
            return False

    def get(self):
        try:
            with self.sessionmaker() as session:
                query = select(FSPEvents).filter_by(id=self.id)
                event: FSPEvents | None = session.execute(query).scalar_one_or_none()
                if event is None:
                    return None

                self.sport = event.sport
                self.title = event.title
                self.description = event.description
                self.participants = event.participants
                self.participants_num = event.participants_num
                self.discipline = event.discipline
                self.region = event.region
                self.representative = event.representative
                self.files = event.files if event.files is not None else []
                self.place = event.place
                self.date_start = event.date_start
                self.date_end = event.date_end
                self.status = event.status

                return self
        except Exception as e:
            print(e)
            return None

    def convert_region_to_key(self):
        if isinstance(self.region, Enum):
            return

        for reg in Regions:
            if reg.value == self.region:
                self.region = reg
                return

    def convert_status_to_key(self):
        if isinstance(self.status, Enum):
            return

        for status in FSPEventStatus:
            if status.value == self.status:
                self.status = status
                return
        
    def get_by_filters(self):
        try:
            with self.sessionmaker() as session:
                query = select(FSPEvents)
                filters = self.get_filters()
                if filters:
                    query = query.filter_by(**filters)

                if self.date_start is not None:
                    query = query.filter(FSPEvents.date_start >= self.date_start)
                if self.date_end is not None:
                    query = query.filter(FSPEvents.date_end <= self.date_end)

                events: list[FSPEvents] = session.scalars(query).all()
                if events is None:
                    return []

                return [FSPevent(**self.get_from_model(event)) for event in events]
        except Exception as e:
            print(f"Error in get_by_filters: {e}")
            return []
        
    def get_from_model(self, model):
        return {
            "id": model.id,
            "sport": model.sport,
            "title": model.title,
            "description": model.description,
            "admin_description": model.admin_description,
            "participants": model.participants,
            "participants_num": model.participants_num,
            "discipline": model.discipline,
            "region": model.region,
            "representative": model.representative,
            "files": model.files,
            "place": model.place,
            "date_start": model.date_start,
            "date_end": model.date_end,
            "status": model.status,
        }

    def get_filters(self) -> dict:
        res = {}
        if self.discipline is not None and self.discipline != "":
            res["discipline"] = self.discipline

        if self.status is not None:
            res["status"] = self.status

        if self.region is not None:
            res["region"] = self.region

        return res

    def get_all(self):
        try:
            with self.sessionmaker() as session:
                query = select(FSPEvents)
                events: list[FSPEvents] = session.execute(query).scalars().all()
                if len(events) == 0:
                    return []

                return events
        except Exception as e:
            print(e)
            return []

    def get_self(self) -> dict:
        return {
            "sport": "Спортивное программирование",
            "title": self.title,
            "description": self.description,
            "admin_description": self.admin_description,
            "participants": self.participants,
            "participants_num": self.participants_num,
            "discipline": self.discipline,
            "region": self.region.name if self.region else None,
            "representative": self.representative,
            "files": self.files if self.files is not None and len(self.files) > 0 else [],
            "place": self.place,
            "date_start": self.date_start,
            "date_end": self.date_end,
            "status": self.status.name if self.status else None,
        }

    def update(self) -> bool:
        try:
            with self.sessionmaker() as session:
                query = update(FSPEvents).filter_by(id=self.id).values(**self.get_self())
                session.execute(query)
                session.commit()
                return True
        except Exception as e:
            print(e)
            return False

    def delete(self) -> bool:
        try:
            with self.sessionmaker() as session:
                query = delete(FSPEvents).filter_by(id=self.id)
                session.execute(query)
                session.commit()
                return True
        except Exception as e:
            print(e)
            return False
