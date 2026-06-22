import { Icon } from "./Icon";

interface StatusMessageProps {
  message: string;
  tone: "error" | "success";
  onDismiss?: () => void;
}

export function StatusMessage({ message, tone, onDismiss }: StatusMessageProps) {
  return (
    <div className={`status-message ${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "alert" : "check"} size={19} />
      <span>{message}</span>
      {onDismiss && (
        <button aria-label="Dismiss message" onClick={onDismiss} type="button">×</button>
      )}
    </div>
  );
}
