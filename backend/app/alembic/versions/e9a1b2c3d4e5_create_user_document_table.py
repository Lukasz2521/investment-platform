"""create user document table

Revision ID: e9a1b2c3d4e5
Revises: d4e5f6a7b8c9
Create Date: 2026-09-26 12:30:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "e9a1b2c3d4e5"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_document",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "document_type"),
    )
    op.create_index(
        op.f("ix_user_document_user_id"), "user_document", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_user_document_document_type"),
        "user_document",
        ["document_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_document_document_type"), table_name="user_document")
    op.drop_index(op.f("ix_user_document_user_id"), table_name="user_document")
    op.drop_table("user_document")
