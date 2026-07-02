import type { DatasetSummary } from "../types/report";
import { ReportCard } from "./ReportCard";

interface DatasetSummaryCardProps {
  summary: DatasetSummary;
}

export function DatasetSummaryCard({
  summary,
}: DatasetSummaryCardProps) {
  const statisticRows = Object.entries(summary.statistics);

  const formatStatistic = (value: number): string =>
    Number.isFinite(value) ? value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }) : "—";

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

        <div className="summary-metric">
          <span>Detected fields</span>
          <strong>{summary.columns.length.toLocaleString()}</strong>
        </div>
      </div>

      <div className="card-subsection">
        <span className="subsection-label">
          Detected fields
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

      {statisticRows.length > 0 && (
        <div className="card-subsection">
          <span className="subsection-label">
            Numeric statistics
          </span>

          <div className="statistics-table-wrap">
            <table className="statistics-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Mean</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Std. Dev.</th>
                </tr>
              </thead>

              <tbody>
                {statisticRows.map(([column, statistics]) => (
                  <tr key={column}>
                    <th scope="row">{column}</th>
                    <td>{formatStatistic(statistics.mean)}</td>
                    <td>{formatStatistic(statistics.min)}</td>
                    <td>{formatStatistic(statistics.max)}</td>
                    <td>{formatStatistic(statistics.std)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportCard>
  );
}
