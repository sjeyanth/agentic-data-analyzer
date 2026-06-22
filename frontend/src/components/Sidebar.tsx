import { Icon, type IconName } from "./Icon";

const navigation: Array<{ label: string; icon: IconName; target: string }> = [
  { label: "Overview", icon: "dashboard", target: "overview" },
  { label: "Executive summary", icon: "clipboard", target: "executive-summary" },
  { label: "Anomalies", icon: "alert", target: "anomalies" },
  { label: "Insights", icon: "insights", target: "insights" },
  { label: "Recommendations", icon: "recommendation", target: "recommendations" },
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
        <span>Forge<span>AI</span></span>
      </div>

      <nav aria-label="Dashboard sections" className="sidebar-nav">
        <p className="nav-label">Workspace</p>
        {navigation.map((item, index) => (
          <button
            className={`nav-item ${index === 0 ? "active" : ""}`}
            disabled={!hasReport && index > 0}
            key={item.target}
            onClick={() => onNavigate(item.target)}
            type="button"
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>API configured</strong>
            <span>Manufacturing analysis</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
