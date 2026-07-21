import pandas as pd
from pandas.testing import assert_frame_equal

from app.services.analysis_service import AnalysisService
from app.services.data_preprocessing_service import DataPreprocessingService
from app.services.data_quality_service import DataQualityService


def test_preprocess_preserves_clean_dataset_unchanged():
    dataframe = pd.read_csv("frontend/public/samples/testdata1.csv")

    original_snapshot = dataframe.copy(deep=True)

    service = DataPreprocessingService()
    processed = service.preprocess(dataframe)

    assert_frame_equal(dataframe, original_snapshot)
    assert_frame_equal(processed, dataframe)


def test_preprocess_normalizes_malformed_values_without_mutating_original():
    dataframe = pd.DataFrame(
        {
            "temperature": ["55", "abc", "60", " "] ,
            "event_date": ["2025-07-01", "INVALID_DATE", "2025-07-03", ""],
            "status": [" Running", "running ", "NULL", "-"],
            "empty_column": [" ", "", None, "NA"],
        }
    )

    original_snapshot = dataframe.copy(deep=True)

    data_quality_service = DataQualityService()
    original_quality = data_quality_service.analyze(dataframe)

    preprocessing_service = DataPreprocessingService()
    processed = preprocessing_service.preprocess(dataframe)

    assert_frame_equal(dataframe, original_snapshot)

    assert len(processed) == 3
    assert "empty_column" not in processed.columns
    assert pd.api.types.is_float_dtype(processed["temperature"])
    assert pd.isna(processed.loc[1, "temperature"])
    assert pd.api.types.is_datetime64_any_dtype(processed["event_date"])
    assert pd.isna(processed.loc[1, "event_date"])
    assert processed.loc[0, "status"] == "Running"
    assert processed.loc[1, "status"] == "running"

    assert data_quality_service.analyze(dataframe) == original_quality


def test_summary_generation_handles_processed_empty_columns_safely():
    dataframe = pd.DataFrame(
        {
            "only_empty": [" ", "NA", None],
            "also_empty": ["", "null", "-"],
        }
    )

    processed = DataPreprocessingService().preprocess(dataframe)

    summary = AnalysisService().generate_summary(processed)

    assert summary == {
        "row_count": 0,
        "column_count": 0,
        "columns": [],
        "statistics": {},
    }