from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:
    """
    Handles database operations for reports.
    """

    def create_report(
        self,
        db: Session,
        insights: str,
        recommendations: str
    ) -> Report:

        report = Report(
            insights=insights,
            recommendations=recommendations
        )

        db.add(report)

        db.commit()

        db.refresh(report)

        return report