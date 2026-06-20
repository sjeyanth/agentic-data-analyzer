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

        prompt = f"""
        You are an operations manager preparing
        an executive report.

        Dataset Summary:
        {summary}

        Insights:
        {insights}

        Recommendations:
        {recommendations}

        Risk Level:
        {risk_level}

        Write a concise executive summary.

        Keep it professional and business-focused.
        """

        response = (
            self.gemini.model.generate_content(
                prompt
            )
        )

        return response.text