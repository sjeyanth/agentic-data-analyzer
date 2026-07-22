from fastapi import FastAPI
from app.core.config import settings

from app.api.report import router as report_router

from app.api.analysis import router as analysis_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title=settings.app_name
)

frontend_origins = [
    origin.strip()
    for origin in settings.frontend_origins.split(",")
    if origin.strip()
]

if not frontend_origins:
    frontend_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5173/",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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