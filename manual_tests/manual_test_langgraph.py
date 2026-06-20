from app.agents.workflow import workflow

result = workflow.invoke(
    {
        "file_path": "data/manufacturing_data.csv"
    }
)

print(result)