import { cn } from "@/lib/utils/cn";

/**
 * The product's signature visual: a horizontal scan beam sweeping across a
 * hairline, echoing the "MRI scanner" metaphor. Reused on the landing hero
 * and dashboard header to reinforce the scanning motif without becoming
 * decoration for its own sake.
 */
export function ScanSweep({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px w-full overflow-hidden bg-line", className)} aria-hidden="true">
      <div className="absolute inset-y-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-scan-cyan to-transparent" />
    </div>
  );
}
