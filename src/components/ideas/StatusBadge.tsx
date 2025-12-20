"use client";

import { cn } from "@/lib/utils";
import type { IdeaStatus } from "@/types/database";

interface StatusBadgeProps {
  status: IdeaStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_CONFIG: Record<
  IdeaStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  new: {
    label: "New",
    bgClass: "bg-blue-500/25",
    textClass: "text-blue-400",
  },
  evaluating: {
    label: "Evaluating",
    bgClass: "bg-amber-500/25",
    textClass: "text-amber-400",
  },
  accepted: {
    label: "Accepted",
    bgClass: "bg-cyan-500/25",
    textClass: "text-cyan-300",
  },
  doing: {
    label: "In Progress",
    bgClass: "bg-emerald-500/25",
    textClass: "text-emerald-400",
  },
  complete: {
    label: "Complete",
    bgClass: "bg-green-500/25",
    textClass: "text-green-400",
  },
  parked: {
    label: "Parked",
    bgClass: "bg-slate-500/25",
    textClass: "text-slate-300",
  },
  dropped: {
    label: "Dropped",
    bgClass: "bg-red-500/25",
    textClass: "text-red-300",
  },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    bgClass: "bg-gray-500/15",
    textClass: "text-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgClass,
        config.textClass,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
