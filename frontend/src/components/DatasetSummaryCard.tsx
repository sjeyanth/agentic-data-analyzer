import { parseDatasetSummary } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface DatasetSummaryCardProps {
  summary: string;
}

export function DatasetSummaryCard({ summary }: DatasetSummaryCardProps) {
  const data = parseDatasetSummary(summary);

  return (
    <ReportCard icon="report" id="dataset-summary" title="Dataset summary">
      <div className="metric-grid">
        <div className="summary-metric">
          <span>Rows analyzed</span>
          <strong>{data.rowCount?.toLocaleString() ?? "—"}</strong>
        </div>
        <div className="summary-metric">
          <span>Total columns</span>
          <strong>{data.columnCount?.toLocaleString() ?? "—"}</strong>
        </div>
      </div>

      <div className="card-subsection">
        <span className="subsection-label">Dataset columns</span>
        {data.columns.length > 0 ? (
          <div className="badge-list">
            {data.columns.map((column) => (
              <span className="data-badge" key={column}>{column}</span>
            ))}
          </div>
        ) : (
          <p className="empty-copy">No column information was returned.</p>
        )}
      </div>
    </ReportCard>
  );
}
