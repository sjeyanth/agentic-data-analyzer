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

            column_anomalies = []

            for index, row in anomaly_rows.iterrows():

                z_score = round(
                    float(z_scores.loc[index]),
                    2
                )

                absolute_z = abs(z_score)

                if absolute_z >= 4:
                    severity = "HIGH"
                elif absolute_z >= 3:
                    severity = "MEDIUM"
                else:
                    severity = "LOW"

                column_anomalies.append(
                    {
                        "row_index": int(index),
                        "value": float(row[column]),
                        "z_score": z_score,
                        "severity": severity
                    }
                )

            anomalies[column] = column_anomalies

        return anomalies