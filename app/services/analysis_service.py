import pandas as pd


class AnalysisService:
    """
    Performs basic dataset analysis.
    """

    def generate_summary(
        self,
        dataframe: pd.DataFrame
    ) -> dict:

        summary = {
            "row_count": len(dataframe),
            "column_count": len(dataframe.columns),
            "columns": list(dataframe.columns),
            "statistics": dataframe.describe().to_dict()
        }

        return summary