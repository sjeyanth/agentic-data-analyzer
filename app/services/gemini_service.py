import json

from google.api_core.exceptions import ResourceExhausted

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

            try:
                response = self.model.generate_content(
                    prompt
                )

                parsed_insights = self._parse_string_list(
                    response.text
                )

                return parsed_insights or self._fallback_insights(
                    data_quality=data_quality,
                    summary=summary,
                    anomalies=anomalies,
                    risk_level=risk_level
                )
            except ResourceExhausted:
                return self._fallback_insights(
                    data_quality=data_quality,
                    summary=summary,
                    anomalies=anomalies,
                    risk_level=risk_level
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

            try:
                response = self.model.generate_content(
                    prompt
                )

                parsed_recommendations = self._parse_string_list(
                    response.text
                )

                return parsed_recommendations or self._fallback_recommendations(
                    summary=summary,
                    anomalies=anomalies,
                    insights=insights
                )
            except ResourceExhausted:
                return self._fallback_recommendations(
                    summary=summary,
                    anomalies=anomalies,
                    insights=insights
                )

    def generate_risk_level(
        self,
        anomalies: dict,
        recommendations: list[str]
    ) -> str:

        prompt = f"""
        You are a domain-independent tabular data risk assessor.

        Infer the dataset domain from the anomaly categories and recommendations.
        If the domain is unclear, assess risk using generic data-analysis terminology.
        Do not assume the dataset is manufacturing, industrial, machine, factory,
        production, sensor, or equipment data unless the fields clearly support it.

        Detected anomalies:
        {anomalies}

        Recommendations:
        {recommendations}

        Determine the overall risk level based on anomaly severity, anomaly volume,
        affected metrics, and likely operational or analytical impact.

        Respond with ONLY one word:

        LOW
        MEDIUM
        HIGH
        CRITICAL
        """

        try:
            response = self.model.generate_content(
                prompt
            )

            normalized_risk = response.text.strip().upper()

            if normalized_risk in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}:
                return normalized_risk

        except ResourceExhausted:
            pass

        return self._fallback_risk_level(
            anomalies=anomalies,
            recommendations=recommendations
        )

    def generate_executive_summary(
        self,
        summary: dict,
        insights: list[str],
        recommendations: list[str],
        risk_level: str
    ) -> str:

        prompt = f"""
        You are a domain-independent analytics advisor preparing an executive report
        for a tabular dataset.

        First infer the most likely dataset domain from:
        - column names and summary statistics
        - detected insights
        - recommendations
        - relationships between fields

        Possible domains include, but are not limited to:
        manufacturing, healthcare, finance, retail, smart buildings, data centers,
        logistics, energy, agriculture, education, and transportation.

        If the domain cannot be confidently determined, describe it as a general
        tabular dataset and use generic data-analysis terminology.

        Never mention manufacturing, production lines, machines, factories, sensors,
        or industrial equipment unless the dataset clearly represents that domain.

        Dataset Summary:
        {summary}

        Insights:
        {insights}

        Recommendations:
        {recommendations}

        Risk Level:
        {risk_level}

        Write a concise executive summary of 120 to 200 words.

        Include:
        - inferred dataset domain
        - overall health or risk assessment
        - major anomalies
        - likely operational or analytical impact
        - recommended next actions

        Keep it professional and business-focused.
        Return only the executive summary text.
        """

        try:
            response = self.model.generate_content(
                prompt
            )

            text = response.text.strip()

            if text:
                return text

        except ResourceExhausted:
            pass

        return self._fallback_executive_summary(
            summary=summary,
            insights=insights,
            recommendations=recommendations,
            risk_level=risk_level
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

    def _anomaly_counts(self, anomalies: dict) -> tuple[int, str, int]:
        total_anomalies = 0
        most_affected_column = "the dataset"
        most_anomalies = 0

        for column_name, values in anomalies.items():
            if not isinstance(values, list):
                continue

            anomaly_count = len(values)
            total_anomalies += anomaly_count

            if anomaly_count > most_anomalies:
                most_anomalies = anomaly_count
                most_affected_column = column_name

        return total_anomalies, most_affected_column, most_anomalies

    def _severity_counts(self, anomalies: dict) -> dict[str, int]:
        severity_counts = {
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
        }

        for values in anomalies.values():
            if not isinstance(values, list):
                continue

            for item in values:
                if isinstance(item, dict):
                    severity = str(item.get("severity", "")).upper()
                    if severity in severity_counts:
                        severity_counts[severity] += 1

        return severity_counts

    def _fallback_insights(
        self,
        data_quality: dict,
        summary: dict,
        anomalies: dict,
        risk_level: str | None = None
    ) -> list[str]:
        total_anomalies, most_affected_column, most_anomalies = self._anomaly_counts(
            anomalies
        )
        severity_counts = self._severity_counts(anomalies)
        data_quality_status = str(
            data_quality.get("overall_status", "UNKNOWN")
        ).upper()

        insights = [
            f"The dataset contains {total_anomalies} detected anomalies across the analyzed columns.",
            f"The most affected field is {most_affected_column} with {most_anomalies} anomalies, showing the strongest concentration of deviations.",
            f"Data quality status is {data_quality_status}, which provides context for how confidently the anomaly patterns can be interpreted.",
        ]

        high_severity = severity_counts["HIGH"]
        medium_severity = severity_counts["MEDIUM"]

        if high_severity:
            insights.append(
                f"High-severity anomalies account for {high_severity} records, indicating the most critical deviations are not isolated to a single event."
            )
        elif medium_severity:
            insights.append(
                f"Medium-severity anomalies account for {medium_severity} records, suggesting the dataset contains notable but less extreme deviations."
            )

        if risk_level:
            insights.append(
                f"The current assessed risk level is {risk_level}, which aligns with the anomaly concentration and severity profile."
            )

        return insights[:6]

    def _fallback_recommendations(
        self,
        summary: dict,
        anomalies: dict,
        insights: list[str]
    ) -> list[str]:
        total_anomalies, most_affected_column, most_anomalies = self._anomaly_counts(
            anomalies
        )
        severity_counts = self._severity_counts(anomalies)

        recommendations = [
            f"Review {most_affected_column} first, since it contains {most_anomalies} anomalies and is the strongest candidate for the root issue.",
            f"Validate the records behind the {severity_counts['HIGH']} high-severity anomalies to separate genuine signals from data-entry or pipeline issues.",
        ]

        if total_anomalies > 0:
            recommendations.append(
                "Compare the affected records against the broader dataset to identify whether the deviations are clustered, seasonal, or linked to a specific process step."
            )
        else:
            recommendations.append(
                "No anomalies were detected, so focus on verifying the summary statistics and confirming the dataset remains stable over time."
            )

        if insights:
            recommendations.append(
                "Use the generated insights to prioritize follow-up analysis on the most concentrated and severe patterns."
            )

        return recommendations[:6]

    def _fallback_risk_level(
        self,
        anomalies: dict,
        recommendations: list[str]
    ) -> str:
        total_anomalies, _, _ = self._anomaly_counts(anomalies)
        severity_counts = self._severity_counts(anomalies)

        if severity_counts["HIGH"] >= 5 or total_anomalies >= 20:
            return "CRITICAL"

        if severity_counts["HIGH"] >= 1 or total_anomalies >= 8:
            return "HIGH"

        if total_anomalies >= 1 or recommendations:
            return "MEDIUM"

        return "LOW"

    def _fallback_executive_summary(
        self,
        summary: dict,
        insights: list[str],
        recommendations: list[str],
        risk_level: str
    ) -> str:

        row_count = summary.get("row_count", "unknown")
        column_count = summary.get("column_count", "unknown")
        primary_insight = insights[0] if insights else "The dataset analysis completed with limited narrative detail available."
        primary_recommendation = recommendations[0] if recommendations else "Review the affected fields to confirm the most likely source of the issue."

        return (
            f"This analysis summarizes a dataset with {row_count} rows and {column_count} columns. "
            f"Key insight: {primary_insight} "
            f"Recommended next step: {primary_recommendation} "
            f"The overall assessed risk level is {risk_level}."
        )

