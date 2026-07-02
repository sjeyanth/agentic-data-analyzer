import type { Anomaly } from "../types/report";
import { humanizeLabel } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface AnomaliesCardProps {
  anomalies: Record<string, Anomaly[]>;
}

export function AnomaliesCard({
  anomalies,
}: AnomaliesCardProps) {

  const categories = Object.entries(anomalies);

  const categoriesWithAnomalies = categories.filter(
    ([, values]) => values.length > 0
  );

  return (
    <ReportCard
      icon="alert"
      id="anomalies"
      title="Detected Anomalies"
      tone="warning"
    >
      {categoriesWithAnomalies.length > 0 ? (
        <div className="anomaly-groups">

          {categoriesWithAnomalies.map(([category, values]) => (

            <section
              className="anomaly-group"
              key={category}
            >

              <div className="anomaly-label">
                <span>{humanizeLabel(category)}</span>
                <small>{values.length} detected</small>
              </div>

              <div className="anomaly-list">

                {values.map((anomaly, index) => (

                  <div
                    className="anomaly-item"
                    key={`${category}-${index}`}
                  >

                    <div
                      className={`severity-badge severity-${anomaly.severity.toLowerCase()}`}
                    >
                      {anomaly.severity}
                    </div>

                    <div className="anomaly-details">

                      <p>
                        <strong>Value:</strong>{" "}
                        {anomaly.value}
                      </p>

                      <p>
                        <strong>Row:</strong>{" "}
                        {anomaly.row_index}
                      </p>

                      <p>
                        <strong>Z-Score:</strong>{" "}
                        {anomaly.z_score}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </section>

          ))}

        </div>
      ) : (

        <div className="positive-empty-state">
          <span>✓</span>
          <p>No significant anomalies were detected.</p>
        </div>

      )}
    </ReportCard>
  );
}