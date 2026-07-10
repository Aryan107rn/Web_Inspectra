"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems } from "@/lib/constants/navigation";
import { DashboardNavIcon } from "./DashboardNavIcon";
import { cn } from "@/lib/utils/cn";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-void-panel/60 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-scan-cyan/10">
          <span className="h-2 w-2 rounded-full bg-scan-cyan" />
          <span className="absolute h-2 w-2 rounded-full bg-scan-cyan animate-pulse-ring" />
        </span>
        <span className="font-display text-base font-semibold text-ink-100">Web Inspectra</span>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard navigation">
        {dashboardNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scan-cyan",
                isActive
                  ? "bg-scan-cyan/10 text-scan-cyan"
                  : "text-ink-400 hover:bg-white/5 hover:text-ink-100"
              )}
            >
              <DashboardNavIcon icon={item.icon} className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-6 py-4 text-xs text-ink-600">
        <p>Web Inspectra v0.1</p>
      </div>
    </aside>
  );
}
