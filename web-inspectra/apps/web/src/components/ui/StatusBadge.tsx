import { cn } from "@/lib/utils/cn";

type BadgeTone = "pass" | "warning" | "fail" | "neutral" | "info";

const toneClassMap: Record<BadgeTone, string> = {
  pass: "bg-scan-green/10 text-scan-green border-scan-green/30",
  warning: "bg-scan-amber/10 text-scan-amber border-scan-amber/30",
  fail: "bg-scan-red/10 text-scan-red border-scan-red/30",
  neutral: "bg-white/5 text-ink-400 border-line",
  info: "bg-scan-violet/10 text-scan-violet border-scan-violet/30",
};

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        toneClassMap[tone]
      )}
    >
      {children}
    </span>
  );
}
