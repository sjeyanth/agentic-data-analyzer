import { Icon } from "./Icon";

export function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-visual">
        <span><Icon name="report" size={28} /></span>
        <i />
        <i />
        <i />
      </div>
      <div>
        <h2>Your analysis will appear here</h2>
        <p>
          Upload a CSV above, or enter an existing report ID in the header to
          open a completed analysis.
        </p>
      </div>
    </section>
  );
}
