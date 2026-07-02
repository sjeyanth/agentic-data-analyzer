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

        response = (
            self.gemini.model.generate_content(
                prompt
            )
        )

        return response.text
