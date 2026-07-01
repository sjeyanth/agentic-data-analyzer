import json

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
        ) -> list[str]:
            
            prompt = f"""
            Based on the following manufacturing analysis, generate actionable recommendations for plant engineers.

            Dataset Summary:
            {summary}

            Detected Anomalies:
            {anomalies}

            Insights:
            {insights}

            Return ONLY a valid JSON array of strings.
            Do not include markdown.
            Do not include explanations.
            Do not include keys or objects.

            Example:
            [
              "Inspect Machine 3 cooling system.",
              "Verify pressure sensor calibration.",
              "Monitor vibration levels."
            ]
            """


            response = self.model.generate_content(
                prompt
            )
            
            return self._parse_recommendations(
                response.text
            )

    def _parse_recommendations(
        self,
        response_text: str
    ) -> list[str]:
        try:
            cleaned_text = (
                response_text
                .strip()
                .removeprefix("```json")
                .removeprefix("```")
                .removesuffix("```")
                .strip()
            )

            parsed_response = json.loads(
                cleaned_text
            )

            if not isinstance(parsed_response, list):
                return []

            return [
                item.strip()
                for item in parsed_response
                if isinstance(item, str) and item.strip()
            ]

        except (json.JSONDecodeError, TypeError):
            return []

