import type { DatasetSummary } from "../types/report";
import { ReportCard } from "./ReportCard";

interface DatasetSummaryCardProps {
  summary: DatasetSummary;
}

export function DatasetSummaryCard({
  summary,
}: DatasetSummaryCardProps) {
  return (
    <ReportCard
      icon="report"
      id="dataset-summary"
      title="Dataset summary"
    >
      <div className="metric-grid">
        <div className="summary-metric">
          <span>Rows analyzed</span>
          <strong>{summary.row_count.toLocaleString()}</strong>
        </div>

        <div className="summary-metric">
          <span>Total columns</span>
          <strong>{summary.column_count.toLocaleString()}</strong>
        </div>
      </div>

      <div className="card-subsection">
        <span className="subsection-label">
          Dataset columns
        </span>

        <div className="badge-list">
          {summary.columns.map((column) => (
            <span
              className="data-badge"
              key={column}
            >
              {column}
            </span>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}