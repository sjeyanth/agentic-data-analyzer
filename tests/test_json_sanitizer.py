import datetime as datetime_module

import numpy as np
import pandas as pd

from app.utils.json_sanitizer import sanitize_for_json


def test_sanitize_for_json_handles_nested_values():
    payload = {
        "summary": {
            "mean": float("nan"),
            "positive": float("inf"),
            "negative": float("-inf"),
            "created_at": pd.Timestamp("2025-07-21T12:30:00"),
            "statistics": [
                np.float64(12.5),
                np.int64(7),
                np.bool_(True),
                {
                    "date": datetime_module.date(2025, 7, 21),
                    "datetime": datetime_module.datetime(2025, 7, 21, 12, 30, 0),
                },
            ],
        }
    }

    sanitized = sanitize_for_json(payload)

    assert sanitized == {
        "summary": {
            "mean": None,
            "positive": None,
            "negative": None,
            "created_at": "2025-07-21T12:30:00",
            "statistics": [
                12.5,
                7,
                True,
                {
                    "date": "2025-07-21",
                    "datetime": "2025-07-21T12:30:00",
                },
            ],
        }
    }


def test_sanitize_for_json_leaves_clean_values_unchanged():
    payload = {
        "summary": {
            "count": 10,
            "label": "clean",
            "nested": [1, 2, 3],
        }
    }

    assert sanitize_for_json(payload) == payload