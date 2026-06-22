export interface AnalysisUploadResponse {
  report_id: number;
  message: string;
}

export interface Report {
  id: number;
  summary: string;
  anomalies: string;
  insights: string;
  recommendations: string;
  risk_level: string;
  executive_summary: string;
}

export interface DatasetSummary {
  rowCount: number | null;
  columnCount: number | null;
  columns: string[];
}

export interface AnomalyCategory {
  category: string;
  values: string[];
}

export type Theme = "light" | "dark";
