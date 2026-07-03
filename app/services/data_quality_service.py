import pandas as pd


class DataQualityService:
    """
    Inspect tabular dataset quality using deterministic checks.
    """

    def analyze(
        self,
        dataframe: pd.DataFrame
    ) -> dict:
        """
        Build a structured data quality report for a DataFrame.
        """

        dataset_info = self._get_dataset_info(
            dataframe
        )

        missing_values = self._get_missing_values(
            dataframe
        )

        duplicate_rows = self._get_duplicate_rows(
            dataframe
        )

        empty_columns = self._get_empty_columns(
            dataframe
        )

        constant_columns = self._get_constant_columns(
            dataframe=dataframe,
            empty_columns=empty_columns
        )

        data_types = self._get_data_types(
            dataframe
        )

        warnings = self._build_warnings(
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            empty_columns=empty_columns,
            constant_columns=constant_columns
        )

        overall_status = self._determine_status(
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            empty_columns=empty_columns,
            constant_columns=constant_columns
        )

        return {
            "overall_status": overall_status,
            "dataset": dataset_info,
            "missing_values": missing_values,
            "duplicate_rows": duplicate_rows,
            "empty_columns": empty_columns,
            "constant_columns": constant_columns,
            "data_types": data_types,
            "warnings": warnings
        }

    def _get_dataset_info(
        self,
        dataframe: pd.DataFrame
    ) -> dict[str, int]:
        """
        Return dataset dimensions.
        """

        return {
            "rows": int(
                len(dataframe)
            ),
            "columns": int(
                len(dataframe.columns)
            )
        }

    def _get_missing_values(
        self,
        dataframe: pd.DataFrame
    ) -> dict[str, int]:
        """
        Return columns with one or more missing values.
        """

        missing_counts = dataframe.isna().sum()

        return {
            str(column): int(count)
            for column, count in missing_counts.items()
            if int(count) > 0
        }

    def _get_duplicate_rows(
        self,
        dataframe: pd.DataFrame
    ) -> int:
        """
        Return the number of duplicate rows.
        """

        return int(
            dataframe.duplicated().sum()
        )

    def _get_empty_columns(
        self,
        dataframe: pd.DataFrame
    ) -> list[str]:
        """
        Return columns where every value is missing.
        """

        return [
            str(column)
            for column in dataframe.columns
            if bool(
                dataframe[column].isna().all()
            )
        ]

    def _get_constant_columns(
        self,
        dataframe: pd.DataFrame,
        empty_columns: list[str]
    ) -> list[str]:
        """
        Return non-empty columns containing only one unique value.
        """

        empty_column_set = set(
            empty_columns
        )

        return [
            str(column)
            for column in dataframe.columns
            if str(column) not in empty_column_set
            and int(
                dataframe[column].nunique(
                    dropna=True
                )
            ) == 1
        ]

    def _get_data_types(
        self,
        dataframe: pd.DataFrame
    ) -> dict[str, str]:
        """
        Return DataFrame column data types as JSON-serializable strings.
        """

        return {
            str(column): str(data_type)
            for column, data_type in dataframe.dtypes.items()
        }

    def _build_warnings(
        self,
        missing_values: dict[str, int],
        duplicate_rows: int,
        empty_columns: list[str],
        constant_columns: list[str]
    ) -> list[str]:
        """
        Build readable data quality warning messages.
        """

        warnings: list[str] = []

        for column, count in missing_values.items():
            warnings.append(
                f"{self._humanize_label(column)} contains {count} missing values."
            )

        if duplicate_rows > 0:
            warnings.append(
                f"Dataset contains {duplicate_rows} duplicate rows."
            )

        for column in constant_columns:
            warnings.append(
                f"{self._humanize_label(column)} is constant across all rows."
            )

        for column in empty_columns:
            warnings.append(
                f"{self._humanize_label(column)} column is completely empty."
            )

        return warnings

    def _determine_status(
        self,
        missing_values: dict[str, int],
        duplicate_rows: int,
        empty_columns: list[str],
        constant_columns: list[str]
    ) -> str:
        """
        Determine the overall data quality status.
        """

        if empty_columns:
            return "CRITICAL"

        if missing_values or duplicate_rows > 0 or constant_columns:
            return "WARNING"

        return "GOOD"

    def _humanize_label(
        self,
        value: str
    ) -> str:
        """
        Convert a column name into a readable label.
        """

        return " ".join(
            word.capitalize()
            for word in value.replace(
                "-",
                "_"
            ).split("_")
            if word
        )
