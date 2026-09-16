"""user campaign metric snapshot

Revision ID: d4e5f6a7b8c9
Revises: c9f1e2a3b4d5
Create Date: 2026-09-16 20:30:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "d4e5f6a7b8c9"
down_revision = "c9f1e2a3b4d5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_campaign",
        sa.Column("cpm", sa.Numeric(precision=18, scale=4), nullable=True),
    )
    op.add_column(
        "user_campaign",
        sa.Column("epc", sa.Numeric(precision=18, scale=4), nullable=True),
    )
    op.add_column(
        "user_campaign",
        sa.Column("ctr", sa.Numeric(precision=18, scale=4), nullable=True),
    )
    op.add_column(
        "user_campaign",
        sa.Column(
            "participation",
            sa.Integer(),
            nullable=False,
            server_default="18",
        ),
    )
    op.add_column(
        "user_campaign",
        sa.Column("settled_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        """
        UPDATE user_campaign AS uc
        SET
            cpm = stats.cpm,
            epc = stats.epc,
            ctr = stats.ctr
        FROM campaign_stats AS stats
        WHERE stats.campaign_id = uc.campaign_id
        """
    )
    op.alter_column("user_campaign", "participation", server_default=None)


def downgrade() -> None:
    op.drop_column("user_campaign", "settled_at")
    op.drop_column("user_campaign", "participation")
    op.drop_column("user_campaign", "ctr")
    op.drop_column("user_campaign", "epc")
    op.drop_column("user_campaign", "cpm")
