from app.services.gemini_service import GeminiService


service = GeminiService()

response = service.generate_recommendations(
    summary={
        "row_count": 6
    },
    anomalies={
        "temperature": [90],
        "pressure": [180]
    },
    insights=[
        "Temperature anomaly detected",
        "Pressure anomaly detected"
    ]
)

print(response)