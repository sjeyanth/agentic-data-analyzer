import type { FormEvent } from "react";
import type { Theme } from "../types/report";
import { Icon } from "./Icon";

interface AppHeaderProps {
  reportId: number | null;
  theme: Theme;
  onLookup: (id: number) => void;
  onToggleTheme: () => void;
}

export function AppHeader({
  reportId,
  theme,
  onLookup,
  onToggleTheme,
}: AppHeaderProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = Number(formData.get("reportId"));

    if (Number.isInteger(id) && id > 0) {
      onLookup(id);
    }
  }

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Manufacturing intelligence</p>
        <h1>Operations analysis</h1>
      </div>

      <div className="header-actions">
        <form className="report-lookup" onSubmit={handleSubmit}>
          <Icon name="report" size={17} />
          <input
            aria-label="Report ID"
            defaultValue={reportId ?? ""}
            key={reportId ?? "empty"}
            min="1"
            name="reportId"
            placeholder="Report ID"
            type="number"
          />
          <button aria-label="Load report" type="submit">
            <Icon name="arrow" size={17} />
          </button>
        </form>

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
