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
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-500",
  },
  evaluating: {
    label: "Evaluating",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-500",
  },
  accepted: {
    label: "Accepted",
    bgClass: "bg-violet-500/15",
    textClass: "text-violet-500",
  },
  doing: {
    label: "In Progress",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-500",
  },
  complete: {
    label: "Complete",
    bgClass: "bg-green-500/15",
    textClass: "text-green-500",
  },
  parked: {
    label: "Parked",
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-400",
  },
  dropped: {
    label: "Dropped",
    bgClass: "bg-red-500/15",
    textClass: "text-red-400",
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
