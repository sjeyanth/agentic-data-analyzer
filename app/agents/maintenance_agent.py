from app.services.gemini_service import GeminiService


class MaintenanceAgent:

    def __init__(self):
        self.gemini = GeminiService()


    def run(
        self,
        summary,
        anomalies,
        insights,
        analysis_meta=None
    ):
        return self.gemini.generate_recommendations(
            summary=summary,
            anomalies=anomalies,
            insights=insights,
            analysis_meta=analysis_meta
        )