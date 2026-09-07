"""create user_campaign table

Revision ID: b4d7e2c91a08
Revises: a91c4e6d8b17
Create Date: 2026-09-07 19:30:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "b4d7e2c91a08"
down_revision = "a91c4e6d8b17"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_campaign",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("campaign_id", sa.Uuid(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("budget", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaign.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_user_campaign_user_id"),
        "user_campaign",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_campaign_campaign_id"),
        "user_campaign",
        ["campaign_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_campaign_campaign_id"), table_name="user_campaign")
    op.drop_index(op.f("ix_user_campaign_user_id"), table_name="user_campaign")
    op.drop_table("user_campaign")
