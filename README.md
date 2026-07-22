# Agentic Data Analyser Platform

## Overview

The Data Analyser Platform is a AI supportedd Full-Stack CSV  data analysis system built around a multi-agent LangGraph workflow. It validates data quality, generates dataset summaries, detects anomalies, produces AI-powered insights, recommendations, and executive summaries, and stores structured reports in PostgreSQL JSONB for display in an interactive dashboard. 

Although originally designed for manufacturing analytics, the platform now supports generic tabular datasets across domains such as manufacturing, server monitoring, finance, retail, IoT, healthcare, and logistics.

The project is now deployed as two separate services:

- Backend API on Render
- Frontend UI on Netlify

The frontend communicates with the Render backend through a configurable API base URL, and the backend allows the deployed frontend origin through CORS.

## Features

- CSV file upload and dataset validation
- Data Quality Agent for missing values, duplicate rows, empty columns, constant columns, and dataset health status (`GOOD`, `WARNING`, `CRITICAL`)
- Automated statistical data analysis
- Domain-independent anomaly detection
- AI-generated operational insights
- AI-assisted operational risk assessment
- Actionable recommendations
- Executive summary generation
- LangGraph-based multi-agent orchestration
- PostgreSQL JSONB storage for structured data quality, summary, anomaly, insight, and recommendation outputs
- Interactive charts that automatically visualize uploaded datasets
- Responsive React dashboard with light and dark themes
- Separate frontend/backend production deployment support
- Graceful fallback analysis when Gemini is unavailable or quota-limited

## Architecture

```mermaid
flowchart TD
    A[CSV Upload] --> B[Data Quality Agent]
    B --> C[Summary Agent]
    C --> D[Anomaly Detection Agent]
    D --> E[Insights Agent]
    E --> F[Recommendation Agent]
    F --> G[Executive Summary Agent]
    G --> H[(PostgreSQL JSONB)]
    H --> I[Frontend Dashboard]
```

The React dashboard sends uploaded CSV data to FastAPI, which runs the LangGraph workflow through specialized agents. Deterministic agents handle data quality, summaries, and anomaly detection, while Gemini-powered agents generate insights, recommendations, and executive summaries. Structured outputs are stored in PostgreSQL JSONB so reports remain queryable and easy to render in the dashboard.

The dashboard presents each report in a focused sequence: Executive Summary, Dataset Summary, Data Quality, Interactive Data Visualization, Detected Anomalies, Operational Insights, and Recommended Actions.

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
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
├── alembic/             # Database migration environment
├── alembic.ini          # Alembic configuration
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
├── netlify.toml         # Netlify frontend deployment config
├── render.toml          # Render backend deployment config
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
FRONTEND_ORIGINS=http://localhost:5173
```

Create the database tables and start FastAPI locally:

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

For production, set `VITE_API_BASE_URL=https://agentic-data-analyzer.onrender.com` in the frontend deployment environment. If the frontend is deployed on a separate domain, set `FRONTEND_ORIGINS` on the backend to that domain so CORS allows requests from it.

The frontend runs at `http://localhost:5173` and the API runs at `http://127.0.0.1:8000` in local development.

## Production Deployment

### Backend on Render

Use a **Web Service** for the backend API.

Recommended Render settings:

- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
    - `APP_NAME=Agentic Manufacturing Analyzer`
    - `ENVIRONMENT=production`
    - `DATABASE_URL=<your Render Postgres internal URL>`
    - `GEMINI_API_KEY=<your Gemini key>`
    - `FRONTEND_ORIGINS=https://thunderous-lamington-87bb52.netlify.app`

Run database migrations against the production database before the app is used:

```bash
alembic upgrade head
```

If your Render plan does not support a pre-deploy hook, run the migration from the Render shell or temporarily include it in the startup flow.

### Frontend on Netlify

Use a **Static Site** for the React frontend.

Recommended Netlify settings:

- **Build Command:** `npm run build`
- **Publish Directory:** `frontend/dist`
- **Environment Variables:**
    - `VITE_API_BASE_URL=https://agentic-data-analyzer.onrender.com`

The frontend must point to the Render backend API URL, and the backend must whitelist the Netlify origin in `FRONTEND_ORIGINS`.

### Deployment Notes

- The backend now supports optional fallback analysis when Gemini is unavailable or rate-limited.
- The backend requires `python-multipart` for CSV upload handling.
- The backend uses Alembic migrations for the production PostgreSQL schema.
- The Alembic environment is configured to load the `app` package correctly during deployment.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check API availability |
| `POST` | `/analysis/upload` | Upload a CSV file and generate a report |
| `POST` | `/analysis/` | Generate a report from a server-side file path |
| `GET` | `/reports/{id}` | Retrieve a stored analysis report |
| `GET` | `/reports/{id}/chart-data` | Retrieve generic chart data for the uploaded CSV |

The upload endpoint accepts `multipart/form-data` with a file field named `file`.

Stored reports include structured JSONB fields for `data_quality`, `summary`, `anomalies`, `insights`, and `recommendations`.

## Future Improvements

- Background processing for long-running analyses
- AI chat with generated reports
- Predictive analytics and root cause analysis
- Authentication and role-based access control
- Report history, search, and filtering

