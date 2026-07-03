from app.agents.state import AnalysisState
from app.services.data_quality_service import DataQualityService


class DataQualityAgent:
    """
    LangGraph agent for deterministic dataset quality analysis.
    """

    def __init__(self):
        self.service = DataQualityService()

    def run(
        self,
        state: AnalysisState
    ) -> dict:
        """
        Analyze the DataFrame in workflow state and return data quality output.
        """

        data_quality = self.service.analyze(
            state["dataframe"]
        )

        return {
            "data_quality": data_quality
        }
