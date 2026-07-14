import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";

const settingsGroups = [
  {
    title: "Scan preferences",
    items: [
      { label: "Default device profile", value: "Desktop" },
      { label: "Network throttling", value: "None (fast connection)" },
      { label: "Re-scan frequency", value: "Manual" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Email on scan completion", value: "Enabled" },
      { label: "Weekly health digest", value: "Disabled" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Settings" title="Workspace settings" description="Preferences for how scans run and how you're notified." />
      <div className="grid gap-6 lg:grid-cols-2">
        {settingsGroups.map((group) => (
          <GlassCard key={group.title} className="p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink-100">{group.title}</h3>
            <dl className="space-y-3">
              {group.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-ink-400">{item.label}</dt>
                  <dd className="text-sm font-medium text-ink-100">{item.value}</dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
