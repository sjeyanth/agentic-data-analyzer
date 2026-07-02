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

        response = (
            self.gemini.model.generate_content(
                prompt
            )
        )

        return response.text.strip()
