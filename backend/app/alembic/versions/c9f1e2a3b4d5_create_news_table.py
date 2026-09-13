"""create news table

Revision ID: c9f1e2a3b4d5
Revises: b4d7e2c91a08
Create Date: 2026-09-12 16:40:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "c9f1e2a3b4d5"
down_revision = "b4d7e2c91a08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "news",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=4000), nullable=False),
        sa.Column("published_at", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_news_published_at"), "news", ["published_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_news_published_at"), table_name="news")
    op.drop_table("news")
