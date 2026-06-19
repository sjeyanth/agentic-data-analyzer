import google.generativeai as genai

from app.core.config import settings


class GeminiService:
    """
    Handles Gemini API interactions.
    """

    def __init__(self):

        genai.configure(
            api_key=settings.gemini_api_key
        )

        self.model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

    def generate_recommendations(
          self,
          summary: dict,
          anomalies: dict,
          insights: list[str]
        ) -> str:
            
            prompt = f"""
            Based on the following analysis, provide actionable recommendations for improving manufacturing processes:

            Dataset Summary:
            {summary}

            Detected Anomalies:
            {anomalies}

            Insights:
            {insights}

            Generate practical recommendations for plant engineers:
            
            Keep recommendations concise.
            """


            response = self.model.generate_content(
                prompt
            )
            
            return response.text

