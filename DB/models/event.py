from DB.models.Base import Base, get_datetime_UTC
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, BIGINT, JSONB
import uuid

from datetime import datetime


class Events(Base):
    __tablename__ = "events"

    repr_cols = ("name",)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )

    event_id: Mapped[int] = mapped_column(BIGINT, nullable=False)

    sport: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(nullable=False)
    participants: Mapped[str] = mapped_column(nullable=False)
    participants_num: Mapped[str] = mapped_column(nullable=False)
    discipline: Mapped[str] = mapped_column(nullable=False)
    place: Mapped[str] = mapped_column(nullable=False)

    gender: Mapped[list] = mapped_column(JSONB, default=lambda: [])

    date_start: Mapped[datetime] = mapped_column(nullable=False)
    date_end: Mapped[datetime] = mapped_column(nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=get_datetime_UTC)
    updated_at: Mapped[datetime] = mapped_column(
        default=get_datetime_UTC, onupdate=get_datetime_UTC
    )
