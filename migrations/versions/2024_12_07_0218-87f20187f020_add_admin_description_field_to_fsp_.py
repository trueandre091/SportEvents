"""Add admin_description field to fsp_events and fsp_events_archive

Revision ID: 87f20187f020
Revises: e67b22fee3f5
Create Date: 2024-12-07 02:18:12.841032

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "87f20187f020"
down_revision: Union[str, None] = "e67b22fee3f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("fsp_events", sa.Column("admin_description", sa.TEXT(), nullable=True))
    op.add_column("fsp_events_archive", sa.Column("admin_description", sa.TEXT(), nullable=True))
    op.create_unique_constraint(None, "users", ["id"])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "users", type_="unique")
    op.drop_column("fsp_events_archive", "admin_description")
    op.drop_column("fsp_events", "admin_description")
    # ### end Alembic commands ###
