"""store original user document filename

Revision ID: f6a7b8c9d0e1
Revises: e9a1b2c3d4e5
Create Date: 2026-10-05 20:45:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "f6a7b8c9d0e1"
down_revision = "e9a1b2c3d4e5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_document",
        sa.Column(
            "original_filename",
            sa.String(length=255),
            nullable=False,
            server_default="",
        ),
    )


def downgrade() -> None:
    op.drop_column("user_document", "original_filename")
