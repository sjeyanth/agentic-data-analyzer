from fastapi import FastAPI
from app.core.config import settings

from app.api.report import router as report_router

from app.api.analysis import router as analysis_router


app = FastAPI(
    title=settings.app_name
)


app.include_router(report_router)
app.include_router(analysis_router)


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