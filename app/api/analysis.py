from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import report
from app.database.dependencies import get_db
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse
)
from app.services.report_service import ReportService

#upload
from fastapi import UploadFile, File
from pathlib import Path





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



#upload endpoint
@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    file_path = upload_dir / file.filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    report = service.generate_report(
        file_path=str(file_path),
        db=db
    )

    return {
        "report_id": report.id,
        "message": "Report generated successfully"
    }