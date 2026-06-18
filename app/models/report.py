from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    summary: Mapped[str] = mapped_column(
        Text
    )

    anomalies: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    insights: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    recommendations: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )