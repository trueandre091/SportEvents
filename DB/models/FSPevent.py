import uuid
from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, TEXT, JSONB

from DB.models.Base import Base, get_datetime_UTC
from DB.models.regionals import Regions
from DB.models.FSPevent_status import FSPEventStatus

class FSPEvents(Base):
    __tablename__ = "fsp_events"

    id: Mapped[UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)

    sport: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[TEXT] = mapped_column(TEXT, nullable=False)
    participants: Mapped[str] = mapped_column(nullable=False)
    participants_num: Mapped[str] = mapped_column(nullable=False)
    discipline: Mapped[str] = mapped_column(nullable=False)
    region: Mapped[Regions] = mapped_column(nullable=False)
    representative: Mapped[str] = mapped_column(nullable=False)
    place: Mapped[str] = mapped_column(nullable=False)

    date_start: Mapped[datetime] = mapped_column(nullable=False)
    date_end: Mapped[datetime] = mapped_column(nullable=False)

    status: Mapped[FSPEventStatus] = mapped_column(nullable=False)
    files: Mapped[list] = mapped_column(
        JSONB, 
        nullable=True,
        default=lambda: [],
        # Пример структуры:
        # [
        #     {
        #         "key": "events/123/file1.pdf",  # путь в S3
        #         "filename": "положение.pdf",     # оригинальное имя файла
        #         "size": 1234567,                # размер в байтах
        #         "mime_type": "application/pdf",  # тип файла
        #         "uploaded_at": "2024-03-14T12:00:00Z"  # время загрузки
        #     },
        #     ...
        # ]
    )

    created_at: Mapped[datetime] = mapped_column(default=get_datetime_UTC)
    updated_at: Mapped[datetime] = mapped_column(
        default=get_datetime_UTC, onupdate=get_datetime_UTC
    )


