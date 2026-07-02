export interface AnalysisUploadResponse {
  report_id: number;
  message: string;
}

export interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  ["25%"]: number;
  ["50%"]: number;
  ["75%"]: number;
}

export interface DatasetSummary {
  row_count: number;
  column_count: number;
  columns: string[];
  statistics: Record<string, Statistics>;
}

export interface Anomaly {
  row_index: number;
  value: number;
  z_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface Report {
  id: number;
  summary: DatasetSummary;
  anomalies: Record<string, Anomaly[]>;
  insights: string[];
  recommendations: string[];
  risk_level: string;
  executive_summary: string;
}

export type Theme = "light" | "dark";