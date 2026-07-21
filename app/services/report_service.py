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
        analysis_meta = {
            "analysis_ai_generated": True,
            "analysis_warning": None,
        }

        workflow_result = workflow.invoke(
            {
                "file_path": file_path,
                "analysis_meta": analysis_meta,
            }
        )

        report = self.repo.create_report(
            db=db,
            summary=(
                workflow_result["summary"]
            ),
            anomalies=(
                workflow_result["anomalies"]
            ),
            data_quality=(
                workflow_result["data_quality"]
            ),
            insights=(
                workflow_result["insights"]
            ),
            recommendations=(
                workflow_result["recommendations"]
            ),
            risk_level=str(
                workflow_result["risk_level"]
            ),
            executive_summary=str(
                workflow_result["executive_summary"]
            ),
            csv_file_path=file_path
        )

        return report, workflow_result.get("analysis_meta", analysis_meta)
