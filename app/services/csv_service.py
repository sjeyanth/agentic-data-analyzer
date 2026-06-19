from pathlib import Path

import pandas as pd


class CSVService:
    """
    Handles CSV loading and validation.
    """

    def load_csv(self, file_path: str) -> pd.DataFrame:
        """
        Load CSV into a Pandas DataFrame.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"CSV file not found: {file_path}"
            )

        return pd.read_csv(path)

    def validate_dataframe(
        self,
        dataframe: pd.DataFrame
    ) -> bool:
        """
        Basic validation.
        """

        if dataframe.empty:
            raise ValueError(
                "CSV file is empty."
            )

        return True