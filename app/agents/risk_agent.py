from app.services.gemini_service import GeminiService


class RiskAgent:

    def __init__(self):
        self.gemini = GeminiService()


    def run(
        self,
        anomalies,
        recommendations
    ):

        prompt = f"""
        You are a manufacturing risk assessor.

        Detected anomalies:
        {anomalies}

        Recommendations:
        {recommendations}

        Determine the overall risk level.

        Respond with ONLY one word:

        LOW
        MEDIUM
        HIGH
        CRITICAL
        """

        response = (
            self.gemini.model.generate_content(
                prompt
            )
        )

        return response.text.strip()