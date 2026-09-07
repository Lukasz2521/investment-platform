"""create campaign_stats table

Revision ID: f3c91a7b2e04
Revises: c4e8f2a91b33
Create Date: 2026-09-06 19:35:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "f3c91a7b2e04"
down_revision = "c4e8f2a91b33"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "campaign_stats",
        sa.Column("campaign_id", sa.Uuid(), nullable=False),
        sa.Column("cpm", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("epc", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("ctr", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("next_tick_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["campaign_id"], ["campaign.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("campaign_id"),
    )
    op.create_index(
        op.f("ix_campaign_stats_next_tick_at"),
        "campaign_stats",
        ["next_tick_at"],
        unique=False,
    )
    op.execute(
        """
        INSERT INTO campaign_stats (
            campaign_id, cpm, epc, ctr, calculated_at, next_tick_at
        )
        SELECT
            id,
            cpm_base,
            ROUND((epc_min + epc_max) / 2, 4),
            ROUND((ctr_min + ctr_max) / 2, 4),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM campaign
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_campaign_stats_next_tick_at"), table_name="campaign_stats")
    op.drop_table("campaign_stats")
