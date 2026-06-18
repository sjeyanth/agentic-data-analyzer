from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:

    def create_report(
        self,
        db: Session,
        summary: str,
        anomalies: str,
        insights: str,
        recommendations: str
    ) -> Report:

        report = Report(
            summary=summary,
            anomalies=anomalies,
            insights=insights,
            recommendations=recommendations
        )

        db.add(report)

        db.commit()

        db.refresh(report)

        return report

    def get_report_by_id(
        self,
        db: Session,
        report_id: int
    ) -> Report | None:

        return (
            db.query(Report)
            .filter(Report.id == report_id)
            .first()
        )