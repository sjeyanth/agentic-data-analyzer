from app.database.session import SessionLocal
from app.repositories.report_repository import ReportRepository


db = SessionLocal()

repo = ReportRepository()

report = repo.create_report(
    db=db,
    summary="Report summary.",
    anomalies="No significant anomalies found.",
    insights="Temperature is stable.",
    recommendations="Continue monitoring.",
    risk_level="Low",
    executive_summary="The system is operating within normal parameters."
)

print(report.id)
print(report.insights)

db.close()