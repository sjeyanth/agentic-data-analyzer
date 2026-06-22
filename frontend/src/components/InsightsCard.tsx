import { parseInsights } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface InsightsCardProps {
  insights: string;
}

export function InsightsCard({ insights }: InsightsCardProps) {
  const items = parseInsights(insights);

  return (
    <ReportCard icon="insights" id="insights" title="Operational insights">
      {items.length > 0 ? (
        <ul className="insight-list">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <span />
              <p>{item}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">No operational insights were returned.</p>
      )}
    </ReportCard>
  );
}
