import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** Custom background colour (hex) for label-style badges */
  color?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "badge-default",
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  outline: "bg-transparent border border-current",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  color,
}: BadgeProps) {
  // If custom colour provided, use it for label-style badges
  if (color) {
    return (
      <span
        className={cn("badge", sizeStyles[size], className)}
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn("badge", variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </span>
  );
}

/** Preset label colours for Kanban cards */
export const LABEL_COLORS = {
  green: "#22C55E",
  yellow: "#EAB308",
  orange: "#F97316",
  red: "#EF4444",
  purple: "#A855F7",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  lime: "#84CC16",
  grey: "#64748B",
} as const;

export type LabelColor = keyof typeof LABEL_COLORS;

interface LabelBadgeProps {
  children: ReactNode;
  color: LabelColor;
  size?: BadgeSize;
  className?: string;
}

/** Convenience component for Kanban-style label badges */
export function LabelBadge({
  children,
  color,
  size = "sm",
  className,
}: LabelBadgeProps) {
  return (
    <Badge color={LABEL_COLORS[color]} size={size} className={className}>
      {children}
    </Badge>
  );
}
