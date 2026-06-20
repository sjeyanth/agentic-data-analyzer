from sqlalchemy.orm import Session

from app.agents.workflow import workflow
from app.repositories.report_repository import ReportRepository


class ReportService:
    """
    Runs workflow and saves reports.
    """

    def __init__(self):
        self.repo = ReportRepository()

    def generate_report(
        self,
        file_path: str,
        db: Session
    ):

        workflow_result = workflow.invoke(
            {
                "file_path": file_path
            }
        )

        report = self.repo.create_report(
            db=db,
            summary=str(
                workflow_result["summary"]
            ),
            anomalies=str(
                workflow_result["anomalies"]
            ),
            insights=str(
                workflow_result["insights"]
            ),
            recommendations=str(
                workflow_result["recommendations"]
            ),
            risk_level=str(
                workflow_result["risk_level"]
            ),
            executive_summary=str(
                workflow_result["executive_summary"]
            )
        )

        return report