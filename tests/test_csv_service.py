from app.services.csv_service import CSVService


def test_load_csv():

    service = CSVService()

    dataframe = service.load_csv(
        "data/manufacturing_data.csv"
    )

    assert dataframe is not None
    assert len(dataframe) == 6