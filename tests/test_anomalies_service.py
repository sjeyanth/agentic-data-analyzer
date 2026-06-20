from app.services.csv_service import CSVService
from app.services.anomalies_service import AnomalyService


def test_detect_anomalies():

    csv_service = CSVService()
    anomaly_service = AnomalyService()

    dataframe = csv_service.load_csv(
        "data/manufacturing_data.csv"
    )

    anomalies = (
        anomaly_service.detect_anomalies(
            dataframe
        )
    )

    assert 90 in anomalies["temperature"]
    assert 180 in anomalies["pressure"]
    assert 1.8 in anomalies["vibration"]