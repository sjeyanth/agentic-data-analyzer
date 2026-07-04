import { Icon, type IconName } from "./Icon";

const navigation: Array<{ id: string; label: string; icon: IconName }> = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "executive-summary", label: "Executive Summary", icon: "clipboard" },
  { id: "data-visualization", label: "Data Visualization", icon: "chart" },
  { id: "anomalies", label: "Anomalies", icon: "alert" },
  { id: "insights", label: "Insights", icon: "insights" },
  { id: "recommendations", label: "Recommendations", icon: "recommendation" },
];

interface SidebarProps {
  hasReport: boolean;
  onNavigate: (target: string) => void;
}

export function Sidebar({ hasReport, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Icon name="logo" size={22} /></span>
        <span> DATA<span> AI</span></span>
      </div>

      <nav aria-label="Dashboard sections" className="sidebar-nav">
        <p className="nav-label">Workspace</p>
        {navigation.map((item, index) => (
          <button
            className={`nav-item ${index === 0 ? "active" : ""}`}
            disabled={!hasReport && index > 0}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        </div>
    </aside>
  );
}
