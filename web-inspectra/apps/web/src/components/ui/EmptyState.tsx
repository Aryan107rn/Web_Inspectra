import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line px-8 py-16 text-center">
      {icon && <div className="mb-4 text-scan-cyan/60">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-400">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
