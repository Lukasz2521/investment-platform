"""use euro for campaign currency

Revision ID: a1b2c3d4e5f7
Revises: f6a7b8c9d0e1
Create Date: 2026-10-05 21:10:00.000000

"""

from alembic import op


revision = "a1b2c3d4e5f7"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE campaign SET currency = 'EUR' WHERE upper(currency) = 'PLN'")


def downgrade() -> None:
    pass
