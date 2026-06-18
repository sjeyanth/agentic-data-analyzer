from app.servcies.csv_service import CSVService
from app.servcies.anomalies_service import AnomalyService


csv_service = CSVService()
anomaly_service = AnomalyService()


df = csv_service.load_csv(
    "data/manufacturing_data.csv"
)

anomalies = anomaly_service.detect_anomalies(
    df
)

print(anomalies)