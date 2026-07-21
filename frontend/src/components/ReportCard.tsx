import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface ReportCardProps {
  children: ReactNode;
  icon: IconName;
  id: string;
  title: string;
  tone?: "default" | "warning" | "action";
}

export function ReportCard({
  children,
  icon,
  id,
  title,
  tone = "default",
}: ReportCardProps) {
  return (
    <article className={`report-section ${tone}`} id={id}>
      <div className="section-heading">
        <span><Icon name={icon} size={19} /></span>
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {children}
      </div>
    </article>
  );
}
