from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID, TEXT, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from DB.models.Base import Base
from DB.models.regionals import Regions
from DB.models.FSPevent_status import FSPEventStatus

class FSPevent_archive(Base):
    __tablename__ = "fsp_events_archive"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    
    sport: Mapped[str] = mapped_column(nullable=True, default="СПОРТИВНОЕ ПРОГРАММИРОВАНИЕ")
    title: Mapped[str] = mapped_column(nullable=True)
    description: Mapped[TEXT] = mapped_column(TEXT, nullable=True)
    admin_description: Mapped[TEXT] = mapped_column(TEXT, nullable=True)
    participants: Mapped[str] = mapped_column(nullable=True)
    participants_num: Mapped[str] = mapped_column(nullable=True)
    discipline: Mapped[str] = mapped_column(nullable=True)
    region: Mapped[Regions] = mapped_column(nullable=True)
    representative: Mapped[str] = mapped_column(nullable=True)
    place: Mapped[str] = mapped_column(nullable=True)

    date_start: Mapped[datetime] = mapped_column(nullable=False)
    date_end: Mapped[datetime] = mapped_column(nullable=False)

    status: Mapped[FSPEventStatus] = mapped_column(nullable=True, default=FSPEventStatus.APPROVED)
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
