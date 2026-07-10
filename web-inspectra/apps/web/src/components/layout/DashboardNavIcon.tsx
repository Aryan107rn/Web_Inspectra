import type { DashboardNavItem } from "@/lib/constants/navigation";

const iconPaths: Record<DashboardNavItem["icon"], string> = {
  overview: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  performance: "M4 19V10m6 9V4m6 15v-7m6 7V8",
  network: "M12 3v4m0 10v4M3 12h4m10 0h4M6.3 6.3l2.8 2.8m6.6 6.6l2.8 2.8M17.7 6.3l-2.8 2.8M8.9 15.7l-2.8 2.8",
  dom: "M4 6h16M4 6v12h6M10 12h10M10 18h10",
  technologies: "M9 3h6l1 4h4l-2 5 2 5h-4l-1 4H9l-1-4H4l2-5-2-5h4l1-4Z",
  accessibility: "M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM4 9h16M12 9v5m0 0-4 7m4-7 4 7",
  security: "M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z",
  "ai-doctor": "M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-7 7-2 2m0-11 2 2m7 7 2 2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  timeline: "M4 6h16M4 6v2a2 2 0 0 0 2 2h1m-3-4v12M20 6v12m-3-8h1a2 2 0 0 0 2-2V6M8 18h8M12 10v4",
  comparison: "M8 3v18M16 3v18M4 8h4m8 0h4M4 16h4m8 0h4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 1-.1 1.2l2 1.6-2 3.4-2.4-.9a8 8 0 0 1-2 1.2L15 22H9l-.5-2.5a8 8 0 0 1-2-1.2l-2.4.9-2-3.4 2-1.6A8 8 0 0 1 4 12a8 8 0 0 1 .1-1.2l-2-1.6 2-3.4 2.4.9a8 8 0 0 1 2-1.2L9 2h6l.5 2.5a8 8 0 0 1 2 1.2l2.4-.9 2 3.4-2 1.6c.067.395.1.795.1 1.2Z",
};

export function DashboardNavIcon({ icon, className }: { icon: DashboardNavItem["icon"]; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={iconPaths[icon]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
