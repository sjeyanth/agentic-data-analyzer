import { ReportCard } from "./ReportCard";

interface RecommendationsCardProps {
  recommendations: string[];
}

export function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  return (
    <ReportCard
      icon="recommendation"
      id="recommendations"
      title="Recommended Actions"
      tone="action"
    >
      {recommendations.length > 0 ? (
        <ol className="action-list">
          {recommendations.map((action, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              <p>{action}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-copy">
          No recommended actions were returned.
        </p>
      )}
    </ReportCard>
  );
}