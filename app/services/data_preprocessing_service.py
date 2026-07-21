from __future__ import annotations

import warnings

import numpy as np
import pandas as pd
from pandas.api.types import is_datetime64_any_dtype, is_object_dtype, is_string_dtype


class DataPreprocessingService:
    """
    Build a safe analysis copy of an uploaded CSV without mutating the source dataframe.
    """

    _missing_tokens = {"", "NA", "N/A", "NULL", "null", "None", "-"}

    def preprocess(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Return a sanitized working copy suitable for downstream analysis.
        """

        processed = dataframe.copy(deep=True)

        processed = self._trim_whitespace(processed)
        processed = self._normalize_missing_values(processed)
        processed = self._normalize_numeric_columns(processed)
        processed = self._normalize_date_columns(processed)
        processed = self._drop_empty_rows(processed)
        processed = self._drop_empty_columns(processed)

        return processed.reset_index(drop=True)

    def _trim_whitespace(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Trim leading and trailing whitespace from string values.
        """

        processed = dataframe.copy(deep=True)

        for column in processed.columns:
            series = processed[column]

            if not self._is_text_column(series):
                continue

            processed[column] = series.map(
                lambda value: value.strip() if isinstance(value, str) else value
            )

        return processed

    def _normalize_missing_values(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Convert common missing-value tokens into NaN.
        """

        processed = dataframe.copy(deep=True)

        for column in processed.columns:
            series = processed[column]

            if not self._is_text_column(series):
                continue

            processed[column] = series.map(
                self._normalize_missing_token
            )

        return processed

    def _normalize_numeric_columns(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Coerce likely numeric columns to numeric dtype.
        """

        processed = dataframe.copy(deep=True)

        for column in processed.columns:
            series = processed[column]

            if not self._is_likely_numeric_column(series):
                continue

            processed[column] = pd.to_numeric(
                series,
                errors="coerce"
            )

        return processed

    def _normalize_date_columns(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Coerce likely date columns to datetime dtype.
        """

        processed = dataframe.copy(deep=True)

        for column in processed.columns:
            series = processed[column]

            if not self._is_likely_date_column(series):
                continue

            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                processed[column] = pd.to_datetime(
                    series,
                    errors="coerce"
                )

        return processed

    def _drop_empty_rows(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Remove rows where every value is missing.
        """

        return dataframe.dropna(
            axis=0,
            how="all"
        )

    def _drop_empty_columns(
        self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Remove columns where every value is missing.
        """

        return dataframe.dropna(
            axis=1,
            how="all"
        )

    def _normalize_missing_token(
        self,
        value
    ):
        """
        Convert supported missing tokens to NaN.
        """

        if isinstance(value, str):
            normalized_value = value.strip()

            if normalized_value in self._missing_tokens:
                return np.nan

            return normalized_value

        return value

    def _is_text_column(
        self,
        series: pd.Series
    ) -> bool:
        """
        Return True for columns that may contain text values.
        """

        return bool(
            is_object_dtype(series)
            or is_string_dtype(series)
        )

    def _is_likely_numeric_column(
        self,
        series: pd.Series
    ) -> bool:
        """
        Return True when most non-missing values can be parsed as numbers.
        """

        if is_datetime64_any_dtype(series):
            return False

        values = series.dropna()

        if values.empty or len(values) < 3:
            return False

        numeric_values = pd.to_numeric(
            values,
            errors="coerce"
        )

        numeric_ratio = float(numeric_values.notna().mean())

        return bool(
            numeric_values.notna().any()
            and numeric_ratio >= 0.6
        )

    def _is_likely_date_column(
        self,
        series: pd.Series
    ) -> bool:
        """
        Return True when most non-missing values can be parsed as dates.
        """

        if is_datetime64_any_dtype(series):
            return False

        values = series.dropna()

        if values.empty or len(values) < 3:
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

        parsed_ratio = float(parsed_values.notna().mean())

        return bool(
            parsed_values.notna().any()
            and parsed_ratio >= 0.6
        )