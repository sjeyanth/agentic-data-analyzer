import type { Report } from "../types/report";
import { getRiskTone, normalizeRiskLevel } from "../utils/report";
import { AnomaliesCard } from "./AnomaliesCard";
import { DatasetSummaryCard } from "./DatasetSummaryCard";
import { Icon } from "./Icon";
import { InsightsCard } from "./InsightsCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { InteractiveChart } from "./InteractiveChart";  
import type { ChartRow } from "../types/chart";


interface ReportDashboardProps {
  report: Report;
  chartData: ChartRow[];
}



export function ReportDashboard({ report, chartData }: ReportDashboardProps) {
  const riskTone = getRiskTone(report.risk_level);

  return (
    <section className="report-dashboard" aria-live="polite">
      <div className="report-title-row">
        <div>
          <span className="section-kicker">Analysis complete</span>
          <h2>Manufacturing intelligence report</h2>
          <p>Report #{report.id}</p>
        </div>
        <div className={`risk-badge ${riskTone}`}>
          <span className="risk-pulse" />
          <div>
            <small>Overall risk</small>
            <strong>{normalizeRiskLevel(report.risk_level)}</strong>
          </div>
        </div>
      </div>

      <article className="executive-card" id="executive-summary">
        <div className="executive-icon"><Icon name="clipboard" size={22} /></div>
        <div>
          <span>Executive summary</span>
          <p>{report.executive_summary}</p>
        </div>
      </article>

      <div className="report-stack">
        <DatasetSummaryCard summary={report.summary} />
        <InteractiveChart data={chartData} />
        <AnomaliesCard anomalies={report.anomalies} />
        <InsightsCard insights={report.insights} />
        <RecommendationsCard recommendations={report.recommendations} />
      </div>

    </section>
  );
}
