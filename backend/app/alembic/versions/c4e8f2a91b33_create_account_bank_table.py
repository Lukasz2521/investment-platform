"""create account_bank table

Revision ID: c4e8f2a91b33
Revises: 5ab4db29769f
Create Date: 2026-06-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c4e8f2a91b33"
down_revision = "5ab4db29769f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "account_bank",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("bank_id", sa.Uuid(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["bank_id"], ["bank.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "bank_id"),
    )
    op.create_index(
        op.f("ix_account_bank_account_id"), "account_bank", ["account_id"], unique=False
    )
    op.create_index(
        op.f("ix_account_bank_bank_id"), "account_bank", ["bank_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_account_bank_bank_id"), table_name="account_bank")
    op.drop_index(op.f("ix_account_bank_account_id"), table_name="account_bank")
    op.drop_table("account_bank")
