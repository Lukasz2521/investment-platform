"""Repair user: hashed_password, created_at, email index after bad migration.

Revision ID: e8b3c92d4411
Revises: d180f61f1a81
Create Date: 2026-05-07

"""
from alembic import op
import sqlalchemy as sa


revision = "e8b3c92d4411"
down_revision = "d180f61f1a81"
branch_labels = None
depends_on = None


def _table_columns(bind: sa.Engine) -> set[str]:
    insp = sa.inspect(bind)
    return {c["name"] for c in insp.get_columns("user")}


def upgrade() -> None:
    conn = op.get_bind()
    cols = _table_columns(conn)

    if "password" in cols and "hashed_password" not in cols:
        existing = sa.inspect(conn).get_columns("user")
        pw_col = next(c for c in existing if c["name"] == "password")
        col_type = pw_col["type"]
        nullable = pw_col["nullable"]
        op.alter_column(
            "user",
            "password",
            new_column_name="hashed_password",
            existing_type=col_type,
            existing_nullable=nullable,
        )
        cols = _table_columns(conn)

    if "created_at" not in cols:
        op.add_column(
            "user",
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        )

    insp = sa.inspect(conn)
    idx_names = {i["name"] for i in insp.get_indexes("user") if i.get("name")}
    uqs = insp.get_unique_constraints("user") or []
    email_unique = any(
        qc.get("column_names") == ("email",) or qc.get("column_names") == ["email"]
        for qc in uqs
    )
    if "ix_user_email" not in idx_names and not email_unique:
        op.create_index("ix_user_email", "user", ["email"], unique=True)


def downgrade() -> None:
    conn = op.get_bind()
    cols = _table_columns(conn)

    op.drop_index("ix_user_email", table_name="user", if_exists=True)

    if "created_at" in cols:
        op.drop_column("user", "created_at")

    if "hashed_password" in cols and "password" not in cols:
        existing = sa.inspect(conn).get_columns("user")
        hp_col = next(c for c in existing if c["name"] == "hashed_password")
        op.alter_column(
            "user",
            "hashed_password",
            new_column_name="password",
            existing_type=hp_col["type"],
            existing_nullable=hp_col["nullable"],
        )
