"""drop campaign.owner_id

Revision ID: b2f4a8e1d0cc
Revises: cde6ee011e6c
Create Date: 2026-05-24

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "b2f4a8e1d0cc"
down_revision = "cde6ee011e6c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("campaign_owner_id_fkey", "campaign", type_="foreignkey")
    op.drop_index(op.f("ix_campaign_owner_id"), table_name="campaign")
    op.drop_column("campaign", "owner_id")


def downgrade() -> None:
    op.add_column(
        "campaign",
        sa.Column("owner_id", sa.Uuid(), nullable=True),
    )
    op.create_foreign_key(
        "campaign_owner_id_fkey",
        "campaign",
        "user",
        ["owner_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(
        op.f("ix_campaign_owner_id"), "campaign", ["owner_id"], unique=False
    )
    # Historical schema required NOT NULL; fill before enforcing if you roll back.
