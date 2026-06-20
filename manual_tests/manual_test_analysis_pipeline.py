from app.services.analysis_pipeline import AnalysisPipeline


pipeline = AnalysisPipeline()

result = pipeline.run(
    "data/manufacturing_data.csv"
)

print(result)