"""drop dataset_id from reports

Revision ID: 20260721_0001
Revises: 
Create Date: 2026-07-21 20:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260721_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("reports", "dataset_id")


def downgrade() -> None:
    op.add_column(
        "reports",
        sa.Column("dataset_id", sa.Integer(), nullable=True),
    )