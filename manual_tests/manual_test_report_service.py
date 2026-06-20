from app.database.session import SessionLocal
from app.services.report_service import ReportService


db = SessionLocal()

service = ReportService()

report = service.generate_report(
    file_path="data/manufacturing_data.csv",
    db=db
)

print("Report ID:", report.id)

db.close()