export interface AnalysisUploadResponse {
  report_id: number;
  message: string;
}

export interface Report {
  id: number;
  summary: string;
  anomalies: Record<string, Anomaly[]>;
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


export interface Anomaly {
  row_index: number;                 //latest
  value: number;
  z_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
}
export interface AnomalyCategory {
  category: string;
  values: string[];
}

export type Theme = "light" | "dark";
