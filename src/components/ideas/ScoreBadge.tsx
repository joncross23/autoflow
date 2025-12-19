"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Get score tier based on value (1-10 scale, averaged from AI evaluation)
 */
function getScoreTier(score: number): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  if (score >= 8) {
    return {
      label: "High",
      bgClass: "bg-green-500/15",
      textClass: "text-green-500",
    };
  }
  if (score >= 5) {
    return {
      label: "Medium",
      bgClass: "bg-amber-500/15",
      textClass: "text-amber-500",
    };
  }
  return {
    label: "Low",
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-400",
  };
}

export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium bg-slate-500/10 text-slate-500",
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          className
        )}
      >
        --
      </span>
    );
  }

  const tier = getScoreTier(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        tier.bgClass,
        tier.textClass,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className="font-semibold">{score.toFixed(1)}</span>
    </span>
  );
}
