"use client";

import type { ReactNode } from "react";
import { useWebsiteScanState } from "@/hooks/useWebsiteScanState";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { scanSummary } = useWebsiteScanState(ACTIVE_SCAN_ID);

  return (
    <div className="flex min-h-screen bg-void bg-scan-grid bg-scan-grid-size">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader scanSummary={scanSummary} />
        <main className="flex-1 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
