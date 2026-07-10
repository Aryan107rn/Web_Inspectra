"use client";

import { useAsyncResource } from "@/hooks/useAsyncResource";
import { websiteScanService } from "@/lib/services/websiteScanService";
import { ACTIVE_SCAN_ID } from "@/lib/constants/scan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { AccessibilityIssueCard } from "@/components/cards/AccessibilityIssueCard";

export default function AccessibilityPage() {
  const { data: issues, isLoading } = useAsyncResource(
    () => websiteScanService.getAccessibilityIssues(ACTIVE_SCAN_ID),
    [],
    "Unable to load accessibility issues."
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Accessibility"
        title="Accessibility report"
        description="Issues explained in plain language, with the specific fix needed for each one."
      />
      {isLoading || !issues ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => <SkeletonLoader key={index} className="h-40 w-full" />)}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState title="No accessibility issues found" description="This scan didn't surface any accessibility problems." />
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => <AccessibilityIssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  );
}
