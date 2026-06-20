from pydantic import BaseModel


class ReportCreate(BaseModel):
    insights: str
    recommendations: str



class ReportResponse(BaseModel):
    id: int

    summary: str

    anomalies: str

    insights: str

    recommendations: str

    risk_level: str

    executive_summary: str

    model_config = {
        "from_attributes": True
    }