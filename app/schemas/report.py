from typing import Any
from pydantic import BaseModel


class ReportCreate(BaseModel):
    data_quality: dict[str, Any]
    insights: list[str]
    recommendations: list[str]


class ReportResponse(BaseModel):
    id: int

    summary: dict[str, Any]

    anomalies: dict[str, Any]

    data_quality: dict[str, Any]

    insights: list[str]

    recommendations: list[str]

    risk_level: str

    executive_summary: str

    model_config = {
        "from_attributes": True
    }
