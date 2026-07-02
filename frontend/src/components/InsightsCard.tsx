import { ReportCard } from "./ReportCard";

interface InsightsCardProps {
  insights: string[];
}

export function InsightsCard({
  insights,
}: InsightsCardProps) {

  return (
    <ReportCard
      icon="insights"
      id="insights"
      title="Operational Insights"
    >
      {insights.length > 0 ? (

        <ul className="insight-list">

          {insights.map((item, index) => (

            <li key={index}>
              <span />
              <p>{item}</p>
            </li>

          ))}

        </ul>

      ) : (

        <p className="empty-copy">
          No operational insights were returned.
        </p>

      )}
    </ReportCard>
  );
}