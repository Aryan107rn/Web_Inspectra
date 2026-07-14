import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function GlassCard({ children, hoverable = false, className, ...rest }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-line bg-void-panel/70 backdrop-blur-xl shadow-glass",
        hoverable && "transition-all duration-300 hover:border-scan-cyan/40 hover:-translate-y-0.5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
