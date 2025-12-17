import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  const isPositive = change && change.value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary-muted p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {change && (
        <div
          className={cn(
            "stat-change mt-2 flex items-center gap-1",
            isPositive ? "stat-change-positive" : "stat-change-negative"
          )}
        >
          <TrendIcon className="h-3 w-3" />
          <span>
            {isPositive ? "+" : ""}
            {change.value}%
          </span>
          {change.label && (
            <span className="text-muted-foreground">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
}

/** Grid wrapper for multiple stat cards */
interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
