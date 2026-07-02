import type { Anomaly } from "../types/report";
import { humanizeLabel } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface AnomaliesCardProps {
  anomalies: Record<string, Anomaly[]>;
}

function formatAnomalyValue(value: number): string {
  return Number.isFinite(value)
    ? value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
    : "—";
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

              <div className="anomaly-group-header">
                <div>
                  <h4>{humanizeLabel(category)}</h4>
                  <p>
                    {values.length} {values.length === 1 ? "anomaly" : "anomalies"}
                  </p>
                </div>
              </div>

              <div className="anomaly-list">

                {values.map((anomaly, index) => (

                  <div
                    className="anomaly-card"
                    key={`${category}-${index}`}
                  >

                    <div
                      className={`severity-badge severity-${anomaly.severity.toLowerCase()}`}
                    >
                      {anomaly.severity}
                    </div>

                    <div className="anomaly-details-grid">

                      <div>
                        <span>Value</span>
                        <strong>{formatAnomalyValue(anomaly.value)}</strong>
                      </div>

                      <div>
                        <span>Row</span>
                        <strong>{anomaly.row_index}</strong>
                      </div>

                      <div>
                        <span>Z-Score</span>
                        <strong>{formatAnomalyValue(anomaly.z_score)}</strong>
                      </div>

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
