import { useState } from "react";
import type { Theme } from "../types/report";
import { Icon } from "./Icon";

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  reportId?: number | null;
  onFetchReportById?: (id: number) => void;
}

export function AppHeader({
  theme,
  onToggleTheme,
  reportId,
  onFetchReportById,
}: AppHeaderProps) {
  const [reportInput, setReportInput] = useState<string>("");

  function submitReportId() {
    if (!reportInput) return;
    const id = Number(reportInput);
    if (Number.isNaN(id)) {
      window.alert("Please enter a valid numeric report id.");
      return;
    }
    onFetchReportById?.(id);
  }
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow"></p>
        <h1> Data Analysis</h1>
      </div>

      <div className="header-actions">
        {reportId ? (
          <div className="report-id-input-wrap current-report" title={`Report ${reportId}`}>
            <input
              className="report-id-input"
              aria-label="Current report id"
              value={`Current report id : ${reportId}`}
              readOnly
            />
          </div>
        ) : null}
        <div className="report-id-input-wrap">
          <input
            className="report-id-input"
            aria-label="Enter report id"
            placeholder="Search Report-id"
            value={reportInput}
            onChange={(e) => setReportInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitReportId();
              }
            }}
          />
          <button
            className="icon-button report-id-submit"
            aria-label="Fetch report"
            type="button"
            onClick={submitReportId}
          >
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <button
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="icon-button"
          onClick={onToggleTheme}
          type="button"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
        </button>
      </div>
    </header>
  );
}
