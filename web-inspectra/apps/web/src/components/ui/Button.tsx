import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-scan-cyan text-void font-semibold hover:shadow-glow-cyan hover:brightness-110",
  secondary:
    "bg-void-raised text-ink-100 border border-line hover:border-scan-cyan/50",
  ghost: "bg-transparent text-ink-300 hover:text-ink-100 hover:bg-white/5",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scan-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-50 disabled:pointer-events-none",
        variantClassMap[variant],
        sizeClassMap[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
