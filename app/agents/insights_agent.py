from app.agents.state import AnalysisState
from app.services.gemini_service import GeminiService


class InsightsAgent:
    """
    LangGraph agent for LLM-powered operational insights.
    """

    def __init__(self):
        self.gemini = GeminiService()

    def run(
        self,
        state: AnalysisState
    ) -> dict:
        """
        Generate insights from  workflow outputs.
        """

        insights = self.gemini.generate_insights(
            data_quality=state["data_quality"],
            summary=state["summary"],
            anomalies=state["anomalies"],
            risk_level=state.get("risk_level"),
            analysis_meta=state.get("analysis_meta")
        )

        return {
            "insights": insights,
            "analysis_meta": state.get("analysis_meta")
        }
