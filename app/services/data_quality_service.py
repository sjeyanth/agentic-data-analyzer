import warnings

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

        row_count = int(
            len(dataframe)
        )

        warnings = self._build_warnings(
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            empty_columns=empty_columns,
            constant_columns=constant_columns,
            row_count=row_count
        )

        warnings.extend(
            self._build_additional_warnings(
                dataframe=dataframe
            )
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

        missing_counts = dataframe.apply(
            lambda column: self._get_missing_mask(column).sum()
        )

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
                self._get_missing_mask(dataframe[column]).all()
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
        constant_columns: list[str],
        row_count: int
    ) -> list[str]:
        """
        Build readable data quality warning messages.
        """

        warnings: list[str] = []

        for column, count in missing_values.items():
            warnings.append(
                f"{self._humanize_label(column)} contains {count} missing values"
                f" ({self._format_percentage(count, row_count)}%)."
            )

        if duplicate_rows > 0:
            warnings.append(
                f"Dataset contains {duplicate_rows} duplicate rows"
                f" ({self._format_percentage(duplicate_rows, row_count)}% of rows)."
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

    def _build_additional_warnings(
        self,
        dataframe: pd.DataFrame
    ) -> list[str]:
        """
        Build generic quality warnings for mixed values and formatting issues.
        """

        warnings: list[str] = []

        for column in dataframe.columns:
            series = dataframe[column]

            if self._has_mixed_numeric_and_text_values(series):
                warnings.append(
                    f"{self._humanize_label(str(column))} contains mixed numeric and text values."
                )

            if self._has_leading_or_trailing_whitespace(series):
                warnings.append(
                    f"{self._humanize_label(str(column))} contains values with leading or trailing whitespace."
                )

            if self._has_inconsistent_capitalization(series):
                warnings.append(
                    f"{self._humanize_label(str(column))} contains inconsistent capitalization."
                )

            if self._has_invalid_numeric_values(series):
                warnings.append(
                    f"{self._humanize_label(str(column))} contains invalid numeric values."
                )

            if self._has_invalid_date_values(series):
                warnings.append(
                    f"{self._humanize_label(str(column))} contains invalid date values."
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

    def _get_missing_mask(
        self,
        series: pd.Series
    ) -> pd.Series:
        """
        Return a boolean mask that treats blank strings as missing.
        """

        missing_mask = series.isna()

        string_mask = series.map(
            lambda value: isinstance(value, str) and value.strip() == ""
        )

        return missing_mask | string_mask

    def _get_non_missing_values(
        self,
        series: pd.Series
    ) -> pd.Series:
        """
        Return values that are not missing, including non-blank strings only.
        """

        return series[~self._get_missing_mask(series)]

    def _get_string_values(
        self,
        series: pd.Series
    ) -> list[str]:
        """
        Return non-missing string values stripped of surrounding whitespace.
        """

        values: list[str] = []

        for value in self._get_non_missing_values(series):
            if isinstance(value, str):
                values.append(value)

        return values

    def _format_percentage(
        self,
        count: int,
        total: int
    ) -> str:
        """
        Format a percentage safely for report output.
        """

        if total <= 0:
            return "0.0"

        return f"{(count / total) * 100:.1f}"

    def _get_numeric_profile(
        self,
        series: pd.Series
    ) -> dict[str, int | float]:
        """
        Summarize how many non-missing values can be parsed as numeric.
        """

        values = self._get_non_missing_values(series)

        if values.empty:
            return {
                "total": 0,
                "numeric": 0,
                "non_numeric": 0,
                "ratio": 0.0,
            }

        numeric_values = pd.to_numeric(values, errors="coerce")
        numeric_count = int(numeric_values.notna().sum())
        total_count = int(len(values))

        return {
            "total": total_count,
            "numeric": numeric_count,
            "non_numeric": total_count - numeric_count,
            "ratio": numeric_count / total_count if total_count else 0.0,
        }

    def _has_mixed_numeric_and_text_values(
        self,
        series: pd.Series
    ) -> bool:
        """
        Detect columns that are mostly numeric but still contain text.
        """

        profile = self._get_numeric_profile(series)

        return bool(
            profile["total"] >= 3
            and profile["numeric"] > 0
            and profile["non_numeric"] > 0
            and profile["ratio"] >= 0.6
        )

    def _has_leading_or_trailing_whitespace(
        self,
        series: pd.Series
    ) -> bool:
        """
        Detect string values padded with whitespace.
        """

        return any(
            isinstance(value, str) and value != value.strip()
            for value in self._get_non_missing_values(series)
        )

    def _has_inconsistent_capitalization(
        self,
        series: pd.Series
    ) -> bool:
        """
        Detect string values that vary only by letter case.
        """

        grouped_values: dict[str, set[str]] = {}

        for value in self._get_string_values(series):
            normalized = value.strip().casefold()

            if not normalized:
                continue

            grouped_values.setdefault(
                normalized,
                set()
            ).add(
                value.strip()
            )

        return any(
            len(variants) > 1
            for variants in grouped_values.values()
        )

    def _has_invalid_numeric_values(
        self,
        series: pd.Series
    ) -> bool:
        """
        Detect numeric-looking columns that contain non-numeric values.
        """

        profile = self._get_numeric_profile(series)

        return bool(
            profile["total"] >= 3
            and profile["numeric"] > 0
            and profile["non_numeric"] > 0
            and profile["ratio"] >= 0.6
        )

    def _has_invalid_date_values(
        self,
        series: pd.Series
    ) -> bool:
        """
        Detect date-like columns that contain values Pandas cannot parse as dates.
        """

        values = self._get_non_missing_values(series)

        if values.empty:
            return False

        string_values = [
            value.strip()
            for value in values
            if isinstance(value, str) and value.strip()
        ]

        if len(string_values) < 3:
            return False

        date_like_signals = sum(
            1
            for value in string_values
            if any(token in value for token in ("-", "/", ":", "T"))
        )

        if date_like_signals == 0:
            return False

        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            parsed_values = pd.to_datetime(
                pd.Series(string_values),
                errors="coerce"
            )

        parsed_count = int(parsed_values.notna().sum())
        total_count = len(string_values)

        return bool(
            parsed_count > 0
            and parsed_count / total_count >= 0.6
            and parsed_count < total_count
        )

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
