class InsightService:
    """
    Converts anomaly data into human-readable insights.
    """

    def generate_insights(
        self,
        anomalies: dict
    ) -> list[str]:

        insights = []

        if anomalies.get("temperature"):
            insights.append(
                "Temperature anomaly detected. Machine may be overheating."
            )

        if anomalies.get("pressure"):
            insights.append(
                "Pressure anomaly detected. Check pressure regulation systems."
            )

        if anomalies.get("vibration"):
            insights.append(
                "Vibration anomaly detected. Potential mechanical wear or imbalance."
            )

        if not insights:
            insights.append(
                "No significant anomalies detected."
            )

        return insights