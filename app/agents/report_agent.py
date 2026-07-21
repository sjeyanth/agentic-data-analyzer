from app.services.gemini_service import GeminiService


class ReportAgent:

    def __init__(self):
        self.gemini = GeminiService()

    def run(
        self,
        summary,
        insights,
        recommendations,
        risk_level
    ):
        return self.gemini.generate_executive_summary(
            summary=summary,
            insights=insights,
            recommendations=recommendations,
            risk_level=risk_level
        )
