import type { DataQuality, DataQualityStatus } from "../types/report";
import { ReportCard } from "./ReportCard";

interface DataQualityCardProps {
  dataQuality: DataQuality;
}

function getMissingValueCount(
  missingValues: Record<string, number>,
): number {
  return Object.values(missingValues).reduce(
    (total, count) => total + count,
    0,
  );
}

function getStatusClass(
  status: DataQualityStatus,
): string {
  return status.toLowerCase();
}

export function DataQualityCard({
  dataQuality,
}: DataQualityCardProps) {
  const missingValueCount = getMissingValueCount(
    dataQuality.missing_values,
  );

  const qualityMetrics = [
    {
      label: "Missing Values",
      value: missingValueCount,
    },
    {
      label: "Duplicate Rows",
      value: dataQuality.duplicate_rows,
    },
    {
      label: "Empty Columns",
      value: dataQuality.empty_columns.length,
    },
    {
      label: "Constant Columns",
      value: dataQuality.constant_columns.length,
    },
  ];

  return (
    <ReportCard
      icon="shield"
      id="data-quality"
      title="Data Quality"
    >
      <div className="quality-status-row">
        <span className="subsection-label">Overall Status</span>
        <span
          className={`quality-status-badge ${getStatusClass(
            dataQuality.overall_status,
          )}`}
        >
          {dataQuality.overall_status}
        </span>
      </div>

      <div className="metric-grid quality-metric-grid">
        {qualityMetrics.map((metric) => (
          <div
            className="summary-metric"
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <div className="card-subsection">
        <span className="subsection-label">
          Warnings
        </span>

        {dataQuality.warnings.length > 0 ? (
          <ul className="quality-warning-list">
            {dataQuality.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>
                <span aria-hidden="true">⚠</span>
                <p>{warning}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="positive-empty-state">
            <span>✓</span>
            <p>No data quality issues detected.</p>
          </div>
        )}
      </div>
    </ReportCard>
  );
}
