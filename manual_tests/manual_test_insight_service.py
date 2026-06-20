from app.services.csv_service import CSVService
from app.services.anomalies_service import AnomalyService
from app.services.insight_service import InsightService


csv_service = CSVService()
anomaly_service = AnomalyService()
insight_service = InsightService()

df = csv_service.load_csv(
    "data/manufacturing_data.csv"
)

anomalies = anomaly_service.detect_anomalies(df)

insights = insight_service.generate_insights(
    anomalies
)

for insight in insights:
    print("-", insight)