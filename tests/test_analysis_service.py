from app.services.csv_service import CSVService
from app.services.analysis_service import AnalysisService


def test_generate_summary():

    csv_service = CSVService()
    analysis_service = AnalysisService()

    dataframe = csv_service.load_csv(
        "data/manufacturing_data.csv"
    )

    summary = (
        analysis_service.generate_summary(
            dataframe
        )
    )

    assert summary["row_count"] == 6
    assert summary["column_count"] == 4