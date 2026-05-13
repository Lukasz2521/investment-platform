"""link campaign to category table

Revision ID: e7d8f9a01bc2
Revises: c8f4b2a91e33
Create Date: 2026-05-11 14:00:00.000000

"""

import uuid

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = "e7d8f9a01bc2"
down_revision = "c8f4b2a91e33"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "category",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_category_name"), "category", ["name"], unique=True)

    op.add_column(
        "campaign",
        sa.Column("category_id", sa.Uuid(), nullable=True),
    )

    conn = op.get_bind()
    campaigns = conn.execute(text("SELECT id, category FROM campaign")).mappings().all()
    name_to_id: dict[str, uuid.UUID] = {}
    for row in campaigns:
        cat_name = row["category"]
        if cat_name not in name_to_id:
            cat_id = uuid.uuid4()
            conn.execute(
                text(
                    "INSERT INTO category (id, name, created_at) "
                    "VALUES (:id, :name, CURRENT_TIMESTAMP)"
                ),
                {"id": cat_id, "name": cat_name},
            )
            name_to_id[cat_name] = cat_id
        conn.execute(
            text("UPDATE campaign SET category_id = :cid WHERE id = :id"),
            {"cid": name_to_id[cat_name], "id": row["id"]},
        )

    op.alter_column("campaign", "category_id", nullable=False)
    op.drop_column("campaign", "category")
    op.create_foreign_key(
        "fk_campaign_category_id_category",
        "campaign",
        "category",
        ["category_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index(
        op.f("ix_campaign_category_id"), "campaign", ["category_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_campaign_category_id"), table_name="campaign")
    op.drop_constraint(
        "fk_campaign_category_id_category", "campaign", type_="foreignkey"
    )
    op.add_column(
        "campaign",
        sa.Column(
            "category",
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=True,
        ),
    )

    conn = op.get_bind()
    rows = (
        conn.execute(
            text(
                "SELECT campaign.id AS cid, category.name AS name "
                "FROM campaign JOIN category ON campaign.category_id = category.id"
            )
        )
        .mappings()
        .all()
    )
    for row in rows:
        conn.execute(
            text("UPDATE campaign SET category = :name WHERE id = :id"),
            {"name": row["name"], "id": row["cid"]},
        )

    op.alter_column("campaign", "category", nullable=False)
    op.drop_column("campaign", "category_id")
    op.drop_index(op.f("ix_category_name"), table_name="category")
    op.drop_table("category")
