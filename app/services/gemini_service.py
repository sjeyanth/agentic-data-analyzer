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

    def generate_insights(
          self,
          data_quality: dict,
          summary: dict,
          anomalies: dict,
          risk_level: str | None = None
        ) -> list[str]:

            prompt = f"""
            You are an AI Data Analyst.

            You will receive structured outputs from previous dataset analysis agents.
            Use only the information provided below.
            Do not invent values, columns, causes, or domain details that are not supported.
            Do not assume the dataset is manufacturing data.
            Work for any tabular dataset from any domain.

            Dataset Quality Report:
            {data_quality}

            Dataset Summary:
            {summary}

            Detected Anomalies:
            {anomalies}

            Risk Level:
            {risk_level or "Not available"}

            Generate concise operational insights that explain:
            - important trends
            - relationships between anomaly categories
            - anomaly concentration or distribution
            - confidence based on dataset quality
            - severity interpretation
            - potential causes only when supported by the provided data

            Rules:
            - Return a maximum of 6 insights.
            - Each insight must be 1 to 2 sentences.
            - Explain what the anomalies mean and why they matter.
            - Do NOT recommend actions.
            - Do NOT use phrases such as "should", "recommend", "inspect", "check", or "monitor".
            - Do NOT mention unavailable columns.
            - Do NOT return markdown.
            - Do NOT return a numbered list.
            - Do NOT include explanations outside the JSON.

            Return ONLY a valid JSON array of strings.

            Example:
            [
              "High-severity anomalies are concentrated in a small subset of records, indicating that the issue is localized rather than widespread.",
              "The data quality report shows no major quality issues, increasing confidence that the detected anomalies reflect real patterns.",
              "Multiple affected metrics contain anomalies, suggesting the dataset includes related deviations rather than isolated noise."
            ]
            """

            response = self.model.generate_content(
                prompt
            )

            return self._parse_string_list(
                response.text
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
            
            return self._parse_string_list(
                response.text
            )

    def _parse_string_list(
        self,
        response_text: str | None
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

        except (json.JSONDecodeError, TypeError, AttributeError):
            return []

