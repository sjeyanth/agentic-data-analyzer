# Agentic Manufacturing Intelligence Platform

## Overview

The Agentic Manufacturing Intelligence Platform analyzes manufacturing CSV data through a multi-agent LangGraph workflow. It detects anomalies, evaluates operational risk, generates maintenance recommendations, creates executive summaries, and stores completed reports in PostgreSQL for display in an interactive dashboard.

## Features

- CSV file upload and validation
- Automated statistical data analysis
- Manufacturing anomaly detection
- AI-assisted operational risk assessment
- Actionable maintenance recommendations
- Executive summary generation
- LangGraph-based multi-agent orchestration
- PostgreSQL report persistence
- Responsive React dashboard with light and dark themes

## Architecture

```mermaid
flowchart TD
    A[CSV Upload] --> B[React Dashboard]
    B --> C[FastAPI]
    C --> D[LangGraph Workflow]
    D --> E[Analysis Agent]
    E --> F[Risk Agent]
    F --> G[Maintenance Agent]
    G --> H[Report Writer Agent]
    H --> I[Gemini AI]
    I --> J[(PostgreSQL)]
    J --> K[Report Dashboard]
```

The React dashboard sends uploaded CSV data to FastAPI, which runs the LangGraph agent workflow. Gemini AI supports the analysis and report generation process, completed reports are stored in PostgreSQL, and the results are presented in the report dashboard.

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- LangGraph
- Gemini API
- Pandas

### Frontend

- React
- TypeScript
- Vite
- Axios

## Project Structure

```text
Agentic_AI-CSV/
├── app/
│   ├── agents/          # LangGraph workflow and AI agents
│   ├── api/             # FastAPI route handlers
│   ├── core/            # Application configuration
│   ├── database/        # Database connection and sessions
│   ├── models/          # SQLAlchemy models
│   ├── repositories/    # Database access layer
│   ├── schemas/         # API request and response models
│   ├── services/        # Analysis and AI services
│   └── main.py          # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable dashboard components
│   │   ├── hooks/       # React hooks
│   │   ├── services/    # Axios API layer
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Report parsing utilities
│   └── package.json
├── tests/               # Backend tests
├── uploads/             # Uploaded CSV files
├── create_tables.py     # Database table initialization
└── requirements.txt
```

## Installation

### 1. Configure the backend

```bash
python -m venv .venv
```

Activate the virtual environment, then install the dependencies:

```bash
pip install -r requirements.txt
```

Create a root `.env` file:

```env
APP_NAME=Agentic Manufacturing Intelligence Platform
ENVIRONMENT=development
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
GEMINI_API_KEY=your_gemini_api_key
```

Create the database tables and start FastAPI:

```bash
python create_tables.py
uvicorn app.main:app --reload
```

### 2. Configure the frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, then start Vite:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://127.0.0.1:8000`.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check API availability |
| `POST` | `/analysis/upload` | Upload a CSV file and generate a report |
| `POST` | `/analysis/` | Generate a report from a server-side file path |
| `GET` | `/reports/{id}` | Retrieve a stored analysis report |

The upload endpoint accepts `multipart/form-data` with a file field named `file`.

## Future Improvements

- Background processing for long-running analyses
- Authentication and role-based access control
- Report history, search, and filtering
- Configurable anomaly detection strategies
- Real-time analysis progress updates
- Automated test coverage for the frontend
- Containerized deployment and CI/CD
