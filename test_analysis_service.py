from app.servcies.csv_service import CSVService
from app.servcies.analysis_service import AnalysisService


csv_service = CSVService()
analysis_service = AnalysisService()


df = csv_service.load_csv(
    "data/manufacturing_data.csv"
)

summary = analysis_service.generate_summary(df)

print(summary)