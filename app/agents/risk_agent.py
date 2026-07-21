from app.services.gemini_service import GeminiService


class RiskAgent:

    def __init__(self):
        self.gemini = GeminiService()


    def run(
        self,
        anomalies,
        recommendations
    ):
        return self.gemini.generate_risk_level(
            anomalies=anomalies,
            recommendations=recommendations
        )
