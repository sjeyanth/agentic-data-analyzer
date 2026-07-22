import type { Theme } from "../types/report";
import { Icon } from "./Icon";

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function AppHeader({
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow"></p>
        <h1> Data Analysis</h1>
      </div>

      <div className="header-actions">
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
