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

export type DataQualityStatus = "GOOD" | "WARNING" | "CRITICAL";

export interface DataQuality {
  overall_status: DataQualityStatus;
  dataset: {
    rows: number;
    columns: number;
  };
  missing_values: Record<string, number>;
  duplicate_rows: number;
  empty_columns: string[];
  constant_columns: string[];
  data_types: Record<string, string>;
  warnings: string[];
}

export interface Report {
  id: number;
  summary: DatasetSummary;
  anomalies: Record<string, Anomaly[]>;
  data_quality: DataQuality;
  insights: string[];
  recommendations: string[];
  risk_level: string;
  executive_summary: string;
}

export type Theme = "light" | "dark";
