from app.services.csv_service import CSVService
from app.services.analysis_service import AnalysisService
from app.services.anomalies_service import AnomalyService
from app.services.insight_service import InsightService


class AnalysisPipeline:
    """
    Orchestrates the entire analysis workflow.
    """

    def __init__(self):
        self.csv_service = CSVService()
        self.analysis_service = AnalysisService()
        self.anomaly_service = AnomalyService()
        self.insight_service = InsightService()

    def run(
        self,
        file_path: str
    ) -> dict:

        dataframe = self.csv_service.load_csv(
            file_path
        )

        self.csv_service.validate_dataframe(
            dataframe
        )

        summary = self.analysis_service.generate_summary(
            dataframe
        )

        anomalies = self.anomaly_service.detect_anomalies(
            dataframe
        )

        insights = self.insight_service.generate_insights(
            anomalies
        )

        return {
            "summary": summary,
            "anomalies": anomalies,
            "insights": insights
        }