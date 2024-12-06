from DB.models.Base import Base, get_datetime_UTC
from DB.models.regionals import Regions
from DB.models.user_roles import UserRoles
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, BIGINT, JSONB, TEXT
import uuid

from datetime import datetime


class Users(Base):
    __tablename__ = "users"

    repr_cols = ("name",)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )

    token: Mapped[str] = mapped_column(TEXT, nullable=True)

    name: Mapped[str] = mapped_column(nullable=True)

    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)

    tg_id: Mapped[int] = mapped_column(BIGINT, nullable=True, unique=True)
    username: Mapped[str] = mapped_column(nullable=True)

    role: Mapped[UserRoles] = mapped_column(nullable=False, default=UserRoles.USER)
    region: Mapped[Regions] = mapped_column(nullable=True)

    notifications: Mapped[list] = mapped_column(JSONB, nullable=True, default=lambda: [])

    created_at: Mapped[datetime] = mapped_column(default=get_datetime_UTC)
    updated_at: Mapped[datetime] = mapped_column(
        default=get_datetime_UTC, onupdate=get_datetime_UTC
    )
