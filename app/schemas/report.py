from pydantic import BaseModel


class ReportCreate(BaseModel):
    insights: str
    recommendations: str


class ReportResponse(BaseModel):
    id: int
    insights: str
    recommendations: str

    model_config = {
        "from_attributes": True
    }