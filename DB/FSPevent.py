from datetime import datetime

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

        if self.auto_add:
            pass

    def add(self):
        try:
            with self.sessionmaker() as session:
                event: FSPEvents = FSPEvents(**self.get_self())
                session.add(event)
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

                # Выводим SQL запрос с параметрами
                compiled = query.compile(
                    dialect=session.bind.dialect,
                    compile_kwargs={"literal_binds": True}
                )
                print("\nSQL Query:")
                print(str(compiled))
                print("\nParameters:", compiled.params)

                events: list[FSPEvents] = session.scalars(query).all()
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
            "sport": self.sport,
            "title": self.title,
            "description": self.description,
            "participants": self.participants,
            "participants_num": self.participants_num,
            "discipline": self.discipline,
            "region": self.region.name if self.region else None,
            "representative": self.representative,
            "files": self.files if len(self.files) > 0 else [],
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
            session.rollback()
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
            session.rollback()
            return False
