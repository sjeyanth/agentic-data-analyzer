from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:

    def create_report(
        self,
        db: Session,
        summary: dict,
        anomalies: dict,
        data_quality: dict,
        insights: list[str],
        recommendations: list[str],
        risk_level: str,
        executive_summary: str,
        csv_file_path: str
        
    ) -> Report:

        report = Report(
            summary=summary,
            anomalies=anomalies,
            data_quality=data_quality,
            insights=insights,
            recommendations=recommendations,
            risk_level=risk_level,
            executive_summary=executive_summary,
            csv_file_path=csv_file_path
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
