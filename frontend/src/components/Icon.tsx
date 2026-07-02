import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "alert"
  | "arrow"
  | "chart"
  | "check"
  | "chevron"
  | "clipboard"
  | "dashboard"
  | "file"
  | "insights"
  | "logo"
  | "moon"
  | "recommendation"
  | "report"
  | "shield"
  | "sun"
  | "upload";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, ReactNode> = {
  alert: <><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.4 2.2 17.5A2 2 0 0 0 3.9 20h16.2a2 2 0 0 0 1.7-2.5L13.7 3.4a2 2 0 0 0-3.4 0Z"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  chart: <><path d="M4 19V5"/><path d="M4 19h16"/><rect width="3" height="7" x="8" y="10" rx="1"/><rect width="3" height="11" x="14" y="6" rx="1"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clipboard: <><rect width="14" height="16" x="5" y="4" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6"/></>,
  dashboard: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
  insights: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  logo: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>,
  recommendation: <><path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.3 14 16 14 18h-4c0-2-.5-2.7-1.5-3.5Z"/></>,
  report: <><path d="M6 2h9l5 5v15H6Z"/><path d="M14 2v6h6M9 13h8M9 17h8"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}
