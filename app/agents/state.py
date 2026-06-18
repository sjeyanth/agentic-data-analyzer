from typing import TypedDict


class AnalysisState(TypedDict, total=False):
    file_path: str

    summary: dict

    anomalies: dict

    insights: list[str]

    recommendations: list[str]