from typing import TypedDict

import pandas as pd


class AnalysisState(TypedDict, total=False):
    file_path: str

    original_dataframe: pd.DataFrame

    processed_dataframe: pd.DataFrame

    dataframe: pd.DataFrame

    analysis_meta: dict

    data_quality: dict

    summary: dict

    anomalies: dict

    insights: list[str]

    recommendations: list[str]

    risk_level: str

    executive_summary: str
