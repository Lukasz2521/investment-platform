"""create campaign_metric_tick table

Revision ID: a91c4e6d8b17
Revises: f3c91a7b2e04
Create Date: 2026-09-06 20:05:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "a91c4e6d8b17"
down_revision = "f3c91a7b2e04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "campaign_metric_tick",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("campaign_id", sa.Uuid(), nullable=False),
        sa.Column("recorded_on", sa.Date(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("cpm", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("epc", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("ctr", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.ForeignKeyConstraint(
            ["campaign_id"], ["campaign.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "campaign_id",
            "recorded_on",
            name="uq_campaign_metric_tick_day",
        ),
    )
    op.create_index(
        op.f("ix_campaign_metric_tick_campaign_id"),
        "campaign_metric_tick",
        ["campaign_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_campaign_metric_tick_recorded_on"),
        "campaign_metric_tick",
        ["recorded_on"],
        unique=False,
    )
    op.execute(
        """
        INSERT INTO campaign_metric_tick (
            id, campaign_id, recorded_on, recorded_at, cpm, epc, ctr
        )
        SELECT
            gen_random_uuid(),
            campaign_id,
            (timezone('UTC', calculated_at))::date,
            calculated_at,
            cpm,
            epc,
            ctr
        FROM campaign_stats
        """
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_campaign_metric_tick_recorded_on"),
        table_name="campaign_metric_tick",
    )
    op.drop_index(
        op.f("ix_campaign_metric_tick_campaign_id"),
        table_name="campaign_metric_tick",
    )
    op.drop_table("campaign_metric_tick")
