import { Icon } from "./Icon";

export function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-visual">
        <span><Icon name="report" size={28} /></span>
        <div className="empty-copy">
          <h2>Your analysis will appear here</h2>
          <p>
            Upload a CSV above to generate a report with insights, anomalies, and recommendations.
          </p>
        </div>
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
