class InsightService:
    """
    Converts anomaly data into domain-independent insights.
    """

    SEVERITY_ORDER = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 4
    }

    ACRONYMS = {
        "api",
        "cpu",
        "db",
        "gpu",
        "http",
        "https",
        "id",
        "io",
        "ip",
        "ms",
        "ram",
        "url"
    }

    def generate_insights(
        self,
        anomalies: dict[str, list[dict[str, object]]]
    ) -> list[str]:
        """
        Generate one concise insight for each anomaly category.
        """

        insights: list[str] = []

        for category, category_anomalies in anomalies.items():
            if not category_anomalies:
                continue

            insights.append(
                self._build_insight(
                    category=category,
                    category_anomalies=category_anomalies
                )
            )

        if not insights:
            return [
                "No significant anomalies detected."
            ]

        return insights

    def _build_insight(
        self,
        category: str,
        category_anomalies: list[dict[str, object]]
    ) -> str:
        """
        Build a single insight sentence for one anomaly category.
        """

        metric_name = self._humanize_label(
            category
        )

        anomaly_count = self._count_anomalies(
            category_anomalies
        )

        highest_severity = self._highest_severity(
            category_anomalies
        )

        observation = (
            "detected anomaly"
            if anomaly_count == 1
            else "detected anomalies"
        )

        return (
            f"{metric_name} shows {anomaly_count} {observation}. "
            f"Highest severity: {highest_severity}."
        )

    def _humanize_label(
        self,
        value: str
    ) -> str:
        """
        Convert a column name into a readable metric label.
        """

        words = value.replace(
            "-",
            "_"
        ).split("_")

        return " ".join(
            self._format_label_word(
                word
            )
            for word in words
            if word
        )

    def _format_label_word(
        self,
        word: str
    ) -> str:
        """
        Format one label word while preserving common acronyms.
        """

        normalized_word = word.lower()

        if normalized_word in self.ACRONYMS:
            return normalized_word.upper()

        return normalized_word.capitalize()

    def _count_anomalies(
        self,
        category_anomalies: list[dict[str, object]]
    ) -> int:
        """
        Count anomaly records in one category.
        """

        return len(
            category_anomalies
        )

    def _highest_severity(
        self,
        category_anomalies: list[dict[str, object]]
    ) -> str:
        """
        Find the highest severity present in one anomaly category.
        """

        highest = "UNKNOWN"
        highest_score = 0

        for anomaly in category_anomalies:
            severity = str(
                anomaly.get(
                    "severity",
                    ""
                )
            ).upper()

            severity_score = self.SEVERITY_ORDER.get(
                severity,
                0
            )

            if severity_score > highest_score:
                highest = severity
                highest_score = severity_score

        return highest
