export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon:
    | "overview"
    | "performance"
    | "network"
    | "dom"
    | "technologies"
    | "accessibility"
    | "security"
    | "ai-doctor"
    | "timeline"
    | "comparison"
    | "settings";
}

export const dashboardNavItems: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "overview" },
  { id: "performance", label: "Performance", href: "/dashboard/performance", icon: "performance" },
  { id: "network", label: "Network", href: "/dashboard/network", icon: "network" },
  { id: "dom-explorer", label: "DOM Explorer", href: "/dashboard/dom-explorer", icon: "dom" },
  { id: "technologies", label: "Technologies", href: "/dashboard/technologies", icon: "technologies" },
  { id: "accessibility", label: "Accessibility", href: "/dashboard/accessibility", icon: "accessibility" },
  { id: "security", label: "Security", href: "/dashboard/security", icon: "security" },
  { id: "ai-doctor", label: "AI Doctor", href: "/dashboard/ai-doctor", icon: "ai-doctor" },
  { id: "timeline", label: "Timeline", href: "/dashboard/timeline", icon: "timeline" },
  { id: "comparison", label: "Comparison", href: "/dashboard/comparison", icon: "comparison" },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings" },
];
