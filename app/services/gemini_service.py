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
            You are a domain-independent data analysis advisor.

            Analyze the tabular dataset context below and first infer the most likely dataset domain from:
            - column names
            - statistical summary
            - detected anomalies
            - relationships between fields

            Possible domains include, but are not limited to:
            manufacturing, healthcare, finance, retail, smart buildings, data centers,
            logistics, energy, agriculture, education, and transportation.

            If the domain cannot be confidently determined, use generic data-analysis terminology.
            Do not invent a domain.
            Never mention manufacturing, production lines, machines, factories, sensors,
            or industrial equipment unless the dataset clearly represents that domain.

            Dataset Summary:
            {summary}

            Detected Anomalies:
            {anomalies}

            Insights:
            {insights}

            Generate 3 to 6 actionable recommendations.
            Recommendations must:
            - be consistent with the inferred domain
            - prioritize high-severity anomalies
            - describe practical next steps
            - avoid generic statements such as "monitor the data"
            - avoid repeating anomaly values verbatim

            Return ONLY a valid JSON array of strings.
            Do not include markdown.
            Do not include explanations.
            Do not include keys or objects.

            Example:
            [
              "Investigate the highest-severity outlier in the affected metric.",
              "Validate whether the abnormal pattern reflects a real operational event.",
              "Prioritize corrective action for records with repeated or severe deviations."
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

