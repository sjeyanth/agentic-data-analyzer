from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse
)
from app.servcies.report_service import ReportService


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)

service = ReportService()


@router.post(
    "/",
    response_model=AnalysisResponse
)
def analyze_csv(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):

    report = service.generate_report(
        file_path=request.file_path,
        db=db
    )

    return AnalysisResponse(
        report_id=report.id,
        message="Report generated successfully"
    )