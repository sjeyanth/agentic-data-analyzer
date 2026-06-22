import { parseRecommendations } from "../utils/report";
import { ReportCard } from "./ReportCard";

interface RecommendationsCardProps {
  recommendations: string;
}

export function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  const actions = parseRecommendations(recommendations);

  return (
    <ReportCard
      icon="recommendation"
      id="recommendations"
      title="Recommended actions"
      tone="action"
    >
      {actions.length > 0 ? (
        <ol className="action-list">
          {actions.map((action, index) => (
            <li key={`${action}-${index}`}>
              <span>{index + 1}</span>
              <p>{action}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-copy">No recommended actions were returned.</p>
      )}
    </ReportCard>
  );
}
