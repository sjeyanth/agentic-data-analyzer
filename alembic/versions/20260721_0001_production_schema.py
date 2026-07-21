"""production schema

Revision ID: 20260721_0001_production_schema
Revises: 
Create Date: 2026-07-21 19:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = "20260721_0001_production_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("summary", JSONB, nullable=False),
        sa.Column("anomalies", JSONB, nullable=False),
        sa.Column("data_quality", JSONB, nullable=False),
        sa.Column("insights", JSONB, nullable=False),
        sa.Column("recommendations", JSONB, nullable=False),
        sa.Column("risk_level", sa.String(length=50), nullable=False),
        sa.Column("executive_summary", sa.Text(), nullable=False),
        sa.Column("csv_file_path", sa.Text(), nullable=False),
        sa.Column("dataset_id", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("reports")