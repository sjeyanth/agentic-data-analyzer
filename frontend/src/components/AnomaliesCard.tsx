import { parseAnomalies } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface AnomaliesCardProps {
  anomalies: string;
}

export function AnomaliesCard({ anomalies }: AnomaliesCardProps) {
  const categories = parseAnomalies(anomalies);
  const categoriesWithAnomalies = categories.filter(({ values }) => values.length > 0);

  return (
    <ReportCard
      icon="alert"
      id="anomalies"
      title="Detected anomalies"
      tone="warning"
    >
      {categoriesWithAnomalies.length > 0 ? (
        <div className="anomaly-groups">
          {categoriesWithAnomalies.map(({ category, values }) => (
            <section className="anomaly-group" key={category}>
              <div className="anomaly-label">
                <span>{category}</span>
                <small>{values.length} detected</small>
              </div>
              <div className="badge-list">
                {values.map((value, index) => (
                  <span className="data-badge anomaly-badge" key={`${category}-${value}-${index}`}>
                    {value}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="positive-empty-state">
          <span>✓</span>
          <p>No significant anomaly values were detected.</p>
        </div>
      )}
    </ReportCard>
  );
}
