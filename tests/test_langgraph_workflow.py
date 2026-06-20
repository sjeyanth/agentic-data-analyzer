from app.agents.workflow import workflow


def test_workflow():

    result = workflow.invoke(
        {
            "file_path":
            "data/manufacturing_data.csv"
        }
    )

    assert "summary" in result

    assert "anomalies" in result

    assert "recommendations" in result

    assert "risk_level" in result

    assert "executive_summary" in result