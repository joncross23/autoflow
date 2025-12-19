"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getTimeAudit, TimeAuditSummary, TimeAuditItem } from "@/lib/api/ideas";
import { cn } from "@/lib/utils";
import type { IdeaStatus } from "@/types/database";

const STATUS_COLORS: Record<IdeaStatus, string> = {
  new: "bg-blue-500/10 text-blue-500",
  evaluating: "bg-yellow-500/10 text-yellow-500",
  accepted: "bg-green-500/10 text-green-500",
  doing: "bg-purple-500/10 text-purple-500",
  complete: "bg-emerald-500/10 text-emerald-500",
  parked: "bg-slate-500/10 text-slate-500",
  dropped: "bg-red-500/10 text-red-500",
};

const HORIZON_COLORS: Record<string, string> = {
  now: "bg-green-500/10 text-green-500 border-green-500/20",
  next: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  later: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  unplanned: "bg-muted text-muted-foreground",
};

const HORIZON_LABELS: Record<string, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
  unplanned: "Unplanned",
};

function formatHours(hours: number): string {
  if (hours < 1) return "<1h";
  if (hours < 8) return `${hours}h`;
  const days = Math.round(hours / 8);
  if (days < 5) return `${days}d`;
  const weeks = Math.round(days / 5);
  return `${weeks}w`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg bg-primary/10", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function HorizonBreakdown({
  data,
}: {
  data: TimeAuditSummary["byHorizon"];
}) {
  const horizons = ["now", "next", "later", "unplanned"] as const;
  const totalRecoverable = Object.values(data).reduce(
    (sum, h) => sum + h.recoverableHours,
    0
  );

  return (
    <div className="card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        By Planning Horizon
      </h3>
      <div className="space-y-3">
        {horizons.map((horizon) => {
          const item = data[horizon];
          const percentage =
            totalRecoverable > 0
              ? Math.round((item.recoverableHours / totalRecoverable) * 100)
              : 0;

          return (
            <div key={horizon}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      HORIZON_COLORS[horizon]
                    )}
                  >
                    {HORIZON_LABELS[horizon]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} ideas
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {item.recoverableHours}h/mo
                </span>
              </div>
              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    horizon === "now"
                      ? "bg-green-500"
                      : horizon === "next"
                      ? "bg-blue-500"
                      : horizon === "later"
                      ? "bg-slate-500"
                      : "bg-muted"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IdeasTable({
  items,
  onIdeaClick,
}: {
  items: TimeAuditItem[];
  onIdeaClick: (id: string) => void;
}) {
  // Filter to only show items with some data
  const relevantItems = items.filter(
    (i) => i.effortHours > 0 || i.recoverableHoursPerMonth > 0
  );

  if (relevantItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No ideas with effort or RICE data yet.</p>
        <p className="text-sm mt-1">
          Add RICE scores to your ideas to see time audit data.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Idea
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Horizon
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Effort
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Recovery/mo
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Payback
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {relevantItems.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors"
              onClick={() => onIdeaClick(item.id)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate max-w-[200px]">
                    {item.title}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                    STATUS_COLORS[item.status]
                  )}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {item.horizon ? (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium capitalize",
                      HORIZON_COLORS[item.horizon]
                    )}
                  >
                    {item.horizon}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {item.effortHours > 0 ? formatHours(item.effortHours) : "-"}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {item.recoverableHoursPerMonth > 0 ? (
                  <span className="text-green-500 font-medium">
                    {item.recoverableHoursPerMonth}h
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {item.paybackMonths !== null ? (
                  <span
                    className={cn(
                      "font-medium",
                      item.paybackMonths <= 1
                        ? "text-green-500"
                        : item.paybackMonths <= 3
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.paybackMonths}mo
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {item.riceScore !== null ? (
                  <span
                    className={cn(
                      "font-medium",
                      item.riceScore >= 5
                        ? "text-green-500"
                        : item.riceScore >= 2
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.riceScore.toFixed(1)}
                  </span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TimeAuditPage() {
  const router = useRouter();
  const [data, setData] = useState<TimeAuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const audit = await getTimeAudit();
      setData(audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIdeaClick = (id: string) => {
    router.push(`/dashboard/ideas?selected=${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <AlertCircle className="h-10 w-10 text-error mx-auto mb-4" />
          <p className="text-error mb-4">{error}</p>
          <button className="btn btn-outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Time Audit</h1>
            <p className="text-muted-foreground">
              Analyse automation ROI and recoverable hours
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={BarChart3}
          label="Total Ideas"
          value={data.totalIdeas.toString()}
          subValue={`${data.items.filter((i) => i.riceScore !== null).length} scored`}
        />
        <StatCard
          icon={Clock}
          label="Total Effort Required"
          value={formatHours(data.totalEffortHours)}
          subValue="Investment to automate"
          color="text-yellow-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Recovery"
          value={`${data.totalRecoverableHoursPerMonth}h`}
          subValue={`${data.annualRecoverableHours}h/year`}
          color="text-green-500"
        />
        <StatCard
          icon={Calendar}
          label="Avg Payback Period"
          value={`${data.avgPaybackMonths}mo`}
          subValue="Time to break even"
          color={data.avgPaybackMonths <= 3 ? "text-green-500" : "text-blue-500"}
        />
      </div>

      {/* Horizon Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <HorizonBreakdown data={data.byHorizon} />

        {/* Quick Summary */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            ROI Summary
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                If all ideas automated:
              </p>
              <p className="text-3xl font-bold text-green-500">
                {data.annualRecoverableHours}
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  hours/year
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ={" "}
                {Math.round(data.annualRecoverableHours / 8)} working days saved
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Investment required:
              </p>
              <p className="text-3xl font-bold text-yellow-500">
                {data.totalEffortHours}
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  hours
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                = {Math.round(data.totalEffortHours / 40)} person-weeks
              </p>
            </div>
          </div>

          {data.totalEffortHours > 0 && data.annualRecoverableHours > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Annual ROI (if all completed):
              </p>
              <p className="text-2xl font-bold text-primary">
                {Math.round(
                  ((data.annualRecoverableHours - data.totalEffortHours) /
                    data.totalEffortHours) *
                    100
                )}
                %
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ideas Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium">Ideas by Priority</h3>
          <p className="text-sm text-muted-foreground">
            Click an idea to view details and add RICE scores
          </p>
        </div>
        <IdeasTable items={data.items} onIdeaClick={handleIdeaClick} />
      </div>
    </div>
  );
}
