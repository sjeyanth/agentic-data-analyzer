import pandas as pd


class AnomalyService:
    """
    Detect anomalies using Z-score.
    """

    def detect_anomalies(
        self,
        dataframe: pd.DataFrame,
        threshold: float = 2.0
    ) -> dict:

        anomalies = {}

        numeric_columns = dataframe.select_dtypes(
            include="number"
        ).columns

        for column in numeric_columns:

            mean = dataframe[column].mean()
            std = dataframe[column].std()

            if std == 0:
                continue

            z_scores = (
                (dataframe[column] - mean)
                / std
            )

            anomaly_rows = dataframe[
                abs(z_scores) > threshold
            ]

            anomalies[column] = (
                anomaly_rows[column]
                .tolist()
            )

        return anomalies