"""Add fsp_events table

Revision ID: 0bf2734331f0
Revises: 4cf1df3a7976
Create Date: 2024-12-06 13:34:31.839182

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0bf2734331f0"
down_revision: Union[str, None] = "4cf1df3a7976"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем enum тип для статуса
    op.execute(
        "CREATE TYPE fspeventstatus AS ENUM ('APPROVED', 'CONSIDERATION', 'REJECTED')"
    )

    # Создаем таблицу
    op.create_table(
        "fsp_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("sport", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.TEXT(), nullable=False),
        sa.Column("participants", sa.String(), nullable=False),
        sa.Column("participants_num", sa.String(), nullable=False),
        sa.Column("discipline", sa.String(), nullable=False),
        sa.Column(
            "region",
            sa.dialects.postgresql.ENUM(name="regions", create_type=False),
            nullable=False,
        ),
        sa.Column("representative", sa.String(), nullable=False),
        sa.Column("place", sa.String(), nullable=False),
        sa.Column("date_start", sa.DateTime(), nullable=False),
        sa.Column("date_end", sa.DateTime(), nullable=False),
        sa.Column(
            "status",
            sa.dialects.postgresql.ENUM(name="fspeventstatus", create_type=False),
            nullable=False,
        ),
        sa.Column("files", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    # Удаляем таблицу
    op.drop_table("fsp_events")
    
    # Удаляем enum тип
    op.execute("DROP TYPE fspeventstatus")
