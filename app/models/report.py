from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from sqlalchemy.dialects.postgresql import JSONB

from app.database.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    summary: Mapped[dict] = mapped_column(
         JSONB,
        nullable=False
    )

    anomalies: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False
    )

    data_quality: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False
    )

    insights: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    recommendations: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False
    )

    risk_level: Mapped[str] = mapped_column(
    String(50),
    nullable=False
    )

    executive_summary: Mapped[str] = mapped_column(
    Text,
    nullable=False
    )

    csv_file_path: Mapped[str] = mapped_column(
    Text,
    nullable=False
    )
