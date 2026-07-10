"""add business day workflow

Revision ID: 20260709_0001
Revises:
Create Date: 2026-07-09 00:01:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260709_0001"
down_revision = None
branch_labels = None
depends_on = None


business_day_status = postgresql.ENUM(
    "OPEN",
    "CLOSED",
    name="businessdaystatus",
    create_type=False,
)


def upgrade():
    business_day_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "business_days",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("business_date", sa.Date(), nullable=False),
        sa.Column("status", business_day_status, nullable=False),
        sa.Column("opened_by", sa.Integer(), nullable=True),
        sa.Column("closed_by", sa.Integer(), nullable=True),
        sa.Column("reopened_by", sa.Integer(), nullable=True),
        sa.Column("opened_at", sa.DateTime(), nullable=False),
        sa.Column("closed_at", sa.DateTime(), nullable=True),
        sa.Column("reopened_at", sa.DateTime(), nullable=True),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("business_date", name="uq_business_days_business_date"),
    )
    op.create_index(op.f("ix_business_days_id"), "business_days", ["id"], unique=False)
    op.create_index(
        op.f("ix_business_days_business_date"),
        "business_days",
        ["business_date"],
        unique=False,
    )

    op.add_column(
        "products",
        sa.Column(
            "product_type",
            sa.String(length=50),
            nullable=False,
            server_default="GENERAL",
        ),
    )
    op.add_column(
        "daily_analytics",
        sa.Column("markup", sa.Numeric(12, 2), nullable=True, server_default="0"),
    )
    op.add_column(
        "daily_analytics",
        sa.Column("margin_percent", sa.Numeric(7, 2), nullable=True, server_default="0"),
    )
    op.alter_column(
        "damages",
        "quantity",
        existing_type=sa.Integer(),
        type_=sa.Numeric(10, 2),
        existing_nullable=False,
    )


def downgrade():
    op.alter_column(
        "damages",
        "quantity",
        existing_type=sa.Numeric(10, 2),
        type_=sa.Integer(),
        existing_nullable=False,
    )
    op.drop_column("daily_analytics", "margin_percent")
    op.drop_column("daily_analytics", "markup")
    op.drop_column("products", "product_type")
    op.drop_index(op.f("ix_business_days_business_date"), table_name="business_days")
    op.drop_index(op.f("ix_business_days_id"), table_name="business_days")
    op.drop_table("business_days")
    business_day_status.drop(op.get_bind(), checkfirst=True)
