"""add user campaign risk mode

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f7
Create Date: 2026-10-07 21:45:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "b7c8d9e0f1a2"
down_revision = "a1b2c3d4e5f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_campaign",
        sa.Column("risk_mode", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "user_campaign",
        sa.Column("risk_spent", sa.Numeric(precision=18, scale=4), nullable=False, server_default="0"),
    )
    op.add_column(
        "user_campaign",
        sa.Column(
            "risk_impressions",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column(
        "user_campaign",
        sa.Column("risk_clicks", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "user_campaign",
        sa.Column(
            "risk_revenue",
            sa.Numeric(precision=18, scale=4),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    op.drop_column("user_campaign", "risk_revenue")
    op.drop_column("user_campaign", "risk_clicks")
    op.drop_column("user_campaign", "risk_impressions")
    op.drop_column("user_campaign", "risk_spent")
    op.drop_column("user_campaign", "risk_mode")
