"""create campaign table

Revision ID: 37575cddeaf0
Revises: 057792d866ca
Create Date: 2026-05-20 18:49:53.196803

"""

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "37575cddeaf0"
down_revision = "057792d866ca"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "campaign",
        sa.Column("epc_min", sa.Numeric(precision=18, scale=4), nullable=False),
    )
    op.add_column(
        "campaign",
        sa.Column("epc_max", sa.Numeric(precision=18, scale=4), nullable=False),
    )
    op.add_column(
        "campaign",
        sa.Column("ctr_min", sa.Numeric(precision=18, scale=4), nullable=False),
    )
    op.add_column(
        "campaign",
        sa.Column("ctr_max", sa.Numeric(precision=18, scale=4), nullable=False),
    )
    op.add_column(
        "campaign",
        sa.Column("location", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    )
    op.add_column(
        "campaign",
        sa.Column(
            "image_url",
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=False,
        ),
    )
    op.add_column(
        "campaign",
        sa.Column(
            "video_url",
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=False,
        ),
    )
    # Use VARCHAR instead of Postgres native ENUM (no CREATE TYPE needed).
    # If min_account was wrongly NUMERIC, map rows to default AccountType value.
    op.alter_column(
        "campaign",
        "min_account",
        existing_type=sa.Numeric(precision=18, scale=4),
        type_=sa.String(length=64),
        existing_nullable=False,
        postgresql_using="'fundament'::character varying",
    )


def downgrade():
    op.alter_column(
        "campaign",
        "min_account",
        existing_type=sa.String(length=64),
        type_=sa.Numeric(precision=18, scale=4),
        existing_nullable=False,
        postgresql_using=(
            "CASE WHEN trim(min_account) ~ '^[-+]?[0-9]*(\\.[0-9]*)?$' "
            "THEN trim(min_account)::numeric ELSE 0::numeric END"
        ),
    )
    op.drop_column("campaign", "video_url")
    op.drop_column("campaign", "image_url")
    op.drop_column("campaign", "location")
    op.drop_column("campaign", "ctr_max")
    op.drop_column("campaign", "ctr_min")
    op.drop_column("campaign", "epc_max")
    op.drop_column("campaign", "epc_min")
