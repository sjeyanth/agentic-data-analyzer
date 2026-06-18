from pydantic import BaseModel



class AnalysisRequest(BaseModel):
    file_path: str


class AnalysisResponse(BaseModel):
    report_id: int
    message: str