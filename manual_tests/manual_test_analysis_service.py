from app.services.csv_service import CSVService
from app.services.analysis_service import AnalysisService


csv_service = CSVService()
analysis_service = AnalysisService()


df = csv_service.load_csv(
    "data/manufacturing_data.csv"
)

summary = analysis_service.generate_summary(df)

print(summary)