"""Add transactions table

Revision ID: f1a2b3c4d5e6
Revises: e8b3c92d4411
Create Date: 2026-05-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "f1a2b3c4d5e6"
down_revision = "e8b3c92d4411"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(18, 4), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("transaction_type", sa.String(length=64), nullable=False),
        sa.Column("description", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transactions_user_id"), "transactions", ["user_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_transactions_user_id"), table_name="transactions")
    op.drop_table("transactions")
