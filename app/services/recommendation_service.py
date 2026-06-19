class RecommendationService:
    """
    Generates recommendations based on anomalies.
    """

    def generate_recommendations(
        self,
        anomalies: dict
    ) -> list[str]:

        recommendations = []

        if anomalies.get("temperature"):
            recommendations.append(
                "Inspect cooling systems and temperature sensors."
            )

        if anomalies.get("pressure"):
            recommendations.append(
                "Inspect pressure valves and regulators."
            )

        if anomalies.get("vibration"):
            recommendations.append(
                "Perform mechanical inspection for wear and imbalance."
            )

        return recommendations