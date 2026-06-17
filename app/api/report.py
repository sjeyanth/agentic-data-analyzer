from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session



from app.database.dependencies import get_db
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportResponse




router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

repo = ReportRepository()


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = repo.get_report_by_id(
        db=db,
        report_id=report_id
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report