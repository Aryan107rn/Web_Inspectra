import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export function LandingCtaSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <GlassCard className="flex flex-col items-center gap-5 p-12 text-center">
        <h2 className="font-display text-3xl font-semibold text-ink-100 md:text-4xl">
          Run your first scan in seconds
        </h2>
        <p className="max-w-md text-sm text-ink-400 md:text-base">
          No account required to explore the dashboard with a sample scan.
        </p>
        <Link href="/dashboard">
          <Button size="lg">Open the dashboard</Button>
        </Link>
      </GlassCard>
    </section>
  );
}
