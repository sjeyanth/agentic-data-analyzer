from fastapi import FastAPI




from app.api.report import router as report_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name
)

app.include_router(report_router)


@app.get("/")
def root():
    return {
        "message": "Agentic Manufacturing Analyzer API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }