from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from DB.DataBase import SessionMaker
from DB.models.FSPevent_archive import FSPevent_archive as FSPevent_archive_model
from DB.models.regionals import Regions
from DB.models.FSPevent_status import FSPEventStatus


class FSPevent_archive:
    def __init__(
            self,
            id: str | None = None,
            sport: str | None = None,
            title: str | None = None,
            description: str | None = None,
            participants: str | None = None,
            participants_num: str | None = None,
            discipline: str | None = None,
            region: Regions | None = None,
            representative: str | None = None,
            place: str | None = None,
            date_start: datetime | None = None,
            date_end: datetime | None = None,
            status: FSPEventStatus | None = None,
            files: list | None = None,
    ):
        self.sessionmaker: sessionmaker = SessionMaker().session_factory

        self.id: str | None = id

        self.sport: str | None = sport
        self.title: str | None = title
        self.description: str | None = description
        self.discipline: str | None = discipline

        self.participants: str | None = participants
        self.participants_num: str | None = participants_num

        self.region: Regions | None = region
        self.place: str | None = place
        self.representative: str | None = representative

        self.date_start: datetime | None = date_start
        self.date_end: datetime | None = date_end

        self.status: FSPEventStatus | None = status
        self.files: list | None = files

    def add(self) -> bool:
        try:
            with self.sessionmaker() as session:
                event = FSPevent_archive_model(**self.get_self())
                session.add(event)
                session.commit()
                return True
        except Exception as e:
            print(f"Error in add: {e}")
            return False

    def get_self(self) -> dict:
        return {
            "sport": self.sport,
            "title": self.title,
            "description": self.description,
            "participants": self.participants,
            "participants_num": self.participants_num,
            "discipline": self.discipline,
            "region": self.region.name if self.region else None,
            "representative": self.representative,
            "place": self.place,
            "date_start": self.date_start,
            "date_end": self.date_end,
            "status": self.status.name if self.status else None,
            "files": self.files if self.files is not None and len(self.files) > 0 else [],
        }

    def get_by_filters(self):
        try:
            with self.sessionmaker() as session:
                query = select(FSPevent_archive_model)
                filters = self.get_filters()
                if filters:
                    query = query.filter_by(**filters)

                if self.date_start is not None:
                    query = query.filter(FSPevent_archive_model.date_start >= self.date_start)
                if self.date_end is not None:
                    query = query.filter(FSPevent_archive_model.date_end <= self.date_end)

                events: list[FSPevent_archive_model] = session.scalars(query).all()
                if events is None:
                    return []

                return events
        except Exception as e:
            print(f"Error in get_by_filters: {e}")
            return []

    def get_filters(self) -> dict:
        res = {}
        if self.discipline is not None and self.discipline != "":
            res["discipline"] = self.discipline

        if self.region is not None:
            res["region"] = self.region

        return res
