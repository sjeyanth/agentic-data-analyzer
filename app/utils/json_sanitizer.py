from __future__ import annotations

import datetime as datetime_module
import math
from typing import Any

import numpy as np
import pandas as pd


def sanitize_for_json(obj: Any) -> Any:
    """
    Recursively convert Python, NumPy, and Pandas values into JSON-safe values.
    """

    if obj is None:
        return None

    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None

    if isinstance(obj, np.generic):
        return sanitize_for_json(obj.item())

    if isinstance(obj, pd.Timestamp):
        if pd.isna(obj):
            return None

        return obj.isoformat()

    if isinstance(obj, datetime_module.datetime):
        if obj.tzinfo is not None:
            return obj.isoformat()

        return obj.isoformat()

    if isinstance(obj, datetime_module.date):
        return obj.isoformat()

    if isinstance(obj, dict):
        return {
            key: sanitize_for_json(value)
            for key, value in obj.items()
        }

    if isinstance(obj, list):
        return [
            sanitize_for_json(value)
            for value in obj
        ]

    return obj