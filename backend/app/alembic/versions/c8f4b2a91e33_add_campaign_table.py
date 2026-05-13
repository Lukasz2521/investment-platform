"""add campaign table

Revision ID: c8f4b2a91e33
Revises: 7dbaa1f360c7
Create Date: 2026-05-11 12:00:00.000000

"""

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "c8f4b2a91e33"
down_revision = "7dbaa1f360c7"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "campaign",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False
        ),
        sa.Column("min_days", sa.Integer(), nullable=False),
        sa.Column("days_count", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column(
            "category", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False
        ),
        sa.Column("min_account", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("budget", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column(
            "currency", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False
        ),
        sa.Column("cpm_base", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("cpm_min", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("cpm_max", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_campaign_owner_id"), "campaign", ["owner_id"], unique=False
    )


def downgrade():
    op.drop_index(op.f("ix_campaign_owner_id"), table_name="campaign")
    op.drop_table("campaign")
