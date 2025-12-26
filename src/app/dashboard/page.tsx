"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Lightbulb,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ListTodo,
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Activity,
} from "lucide-react";
import { QuickCapture } from "@/components/ideas";
import { getIdeaCounts, getIdeas } from "@/lib/api/ideas";
import { getRecentActivity, type ActivityLogEntry, type ActivityAction } from "@/lib/api/activity";
import { StatusBadge } from "@/components/ideas/StatusBadge";
import { useToast } from "@/hooks/useToast";
import type { IdeaStatus, DbIdea } from "@/types/database";

export default function DashboardPage() {
  const [ideaCounts, setIdeaCounts] = useState<Record<IdeaStatus, number> | null>(null);
  const [activeIdeas, setActiveIdeas] = useState<DbIdea[]>([]);
  const [completedIdeas, setCompletedIdeas] = useState<DbIdea[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const loadStats = async () => {
    try {
      const [counts, ideas, completed] = await Promise.all([
        getIdeaCounts(),
        getIdeas({ status: ["accepted", "doing"], archived: false }),
        getIdeas({ status: ["complete"], archived: false }),
      ]);
      setIdeaCounts(counts);
      setActiveIdeas(ideas);
      setCompletedIdeas(completed);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const activityData = await getRecentActivity(10);
      setActivities(activityData);
    } catch (err) {
      console.error("Failed to load activity data:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadActivities();
  }, []);

  // Total ideas logged (all statuses)
  const totalIdeas = ideaCounts
    ? Object.values(ideaCounts).reduce((sum, count) => sum + (count || 0), 0)
    : 0;

  const pipelineCount = ideaCounts
    ? (ideaCounts.new || 0) +
      (ideaCounts.evaluating || 0) +
      (ideaCounts.accepted || 0)
    : 0;

  const inProgressCount = ideaCounts
    ? (ideaCounts.doing || 0)
    : 0;

  const doneCount = ideaCounts
    ? (ideaCounts.complete || 0)
    : 0;

  // Calculate completed this week and this month dynamically
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completedThisWeek = completedIdeas.filter(
    (idea) => idea.completed_at && new Date(idea.completed_at) >= weekAgo
  ).length;

  const completedThisMonth = completedIdeas.filter(
    (idea) => idea.completed_at && new Date(idea.completed_at) >= monthAgo
  ).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-24 md:pb-6">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-foreground-muted mt-1 text-sm md:text-base">
          Welcome back. Here&apos;s your automation overview.
        </p>
      </header>

      {/* Quick Capture */}
      <div className="mb-6">
        <QuickCapture onSuccess={loadStats} />
      </div>

      {/* Stats Row */}
      <div data-testid="dashboard-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardStatCard
          label="Ideas Logged"
          value={loading ? "-" : totalIdeas.toString()}
          icon={<Lightbulb className="h-5 w-5" />}
          color="#3B82F6"
          href="/dashboard/ideas"
        />
        <DashboardStatCard
          label="In Pipeline"
          value={loading ? "-" : pipelineCount.toString()}
          icon={<Clock className="h-5 w-5" />}
          color="#F59E0B"
          href="/dashboard/ideas?status=new,evaluating,accepted"
        />
        <DashboardStatCard
          label="In Progress"
          value={loading ? "-" : inProgressCount.toString()}
          icon={<ListTodo className="h-5 w-5" />}
          color="#8B5CF6"
          href="/dashboard/tasks"
        />
        <DashboardStatCard
          label="Done"
          value={loading ? "-" : doneCount.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
          color="#22C55E"
          href="/dashboard/ideas?status=complete"
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pipeline + Completed Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ideas Pipeline */}
            <PipelineWidget ideaCounts={ideaCounts} loading={loading} />

            {/* Completed Stats */}
            <div className="card p-5">
              <Link
                href="/dashboard/ideas?status=complete"
                className="text-[15px] font-semibold mb-4 block hover:text-primary transition-colors"
              >
                Completed Ideas
              </Link>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "This Week", value: loading ? "-" : completedThisWeek.toString(), href: "/dashboard/ideas?status=complete&period=week" },
                  { label: "This Month", value: loading ? "-" : completedThisMonth.toString(), href: "/dashboard/ideas?status=complete&period=month" },
                  { label: "All Time", value: loading ? "-" : doneCount.toString(), href: "/dashboard/ideas?status=complete" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-center p-3 bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors"
                  >
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className="text-[11px] text-foreground-muted">{item.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Active Ideas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold">Ideas in Progress</h3>
              <Link
                href="/dashboard/tasks"
                className="text-[13px] font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Task Board <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
              </div>
            ) : activeIdeas.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-foreground-muted text-sm">No ideas in progress yet.</p>
                <Link href="/dashboard/ideas" className="btn btn-primary mt-4 inline-flex">
                  View all ideas
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {activeIdeas.slice(0, 4).map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity Feed (hidden on mobile) */}
        <div className="hidden lg:block">
          <ActivityFeed activities={activities} loading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
}

const DashboardStatCard = memo(function DashboardStatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[13px] text-foreground-muted font-medium">{label}</span>
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[32px] font-bold tracking-tight">{value}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card p-5 hover:border-primary transition-colors cursor-pointer">
        {content}
      </Link>
    );
  }

  return <div className="card p-5">{content}</div>;
});

const PipelineWidget = memo(function PipelineWidget({
  ideaCounts,
  loading,
}: {
  ideaCounts: Record<IdeaStatus, number> | null;
  loading: boolean;
}) {
  const stages = [
    { key: "new", label: "New", color: "#3B82F6", href: "/dashboard/ideas?status=new" },
    { key: "evaluating", label: "Evaluating", color: "#F59E0B", href: "/dashboard/ideas?status=evaluating" },
    { key: "accepted", label: "Accepted", color: "#8B5CF6", href: "/dashboard/ideas?status=accepted" },
    { key: "doing", label: "In Progress", color: "#10B981", href: "/dashboard/tasks" },
  ] as const;

  const total = ideaCounts
    ? stages.reduce((sum, s) => sum + (ideaCounts[s.key as IdeaStatus] || 0), 0)
    : 0;

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <Link href="/dashboard/ideas" className="text-[15px] font-semibold hover:text-primary transition-colors">
          Ideas Pipeline
        </Link>
        <span className="text-xs text-foreground-muted">{total} active</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      ) : (
        <>
          {/* Stacked Progress Bar */}
          <div className="flex h-2 rounded overflow-hidden mb-4">
            {stages.map((stage) => {
              const count = ideaCounts?.[stage.key as IdeaStatus] || 0;
              return (
                <Link
                  key={stage.key}
                  href={stage.href}
                  style={{
                    flex: count || 0.01,
                    backgroundColor: stage.color,
                  }}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {stages.map((stage) => (
              <Link
                key={stage.key}
                href={stage.href}
                className="flex items-center gap-2 p-1 -m-1 rounded hover:bg-bg-hover transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs text-foreground-secondary flex-1">
                  {stage.label}
                </span>
                <span className="text-[13px] font-semibold">
                  {ideaCounts?.[stage.key as IdeaStatus] || 0}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

// Effort colours defined outside component to avoid recreation
const EFFORT_COLORS: Record<string, string> = {
  trivial: "#22C55E",
  small: "#22C55E",
  medium: "#F59E0B",
  large: "#EF4444",
  xlarge: "#EF4444",
};

const IdeaCard = memo(function IdeaCard({ idea }: { idea: DbIdea }) {
  return (
    <Link
      href={`/dashboard/ideas?selected=${idea.id}`}
      className="card p-4 hover:border-primary transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-1 h-10 rounded shrink-0"
          style={{ backgroundColor: EFFORT_COLORS[idea.effort_estimate || "medium"] || "#64748B" }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {idea.title}
          </h4>
          <div className="mt-1">
            <StatusBadge status={idea.status} size="sm" />
          </div>
        </div>
      </div>

      {idea.description && (
        <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
          {idea.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>
          {idea.effort_estimate ? idea.effort_estimate.charAt(0).toUpperCase() + idea.effort_estimate.slice(1) : "No estimate"}
        </span>
        <span>
          {new Date(idea.updated_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
});

/**
 * Get the appropriate icon component for an activity action
 */
function getActivityIconComponent(action: ActivityAction): React.ComponentType<{ className?: string }> {
  switch (action) {
    case "created":
      return Plus;
    case "deleted":
      return Trash2;
    case "status_changed":
      return TrendingUp;
    case "archived":
      return Archive;
    case "unarchived":
      return ArchiveRestore;
    case "commented":
      return MessageSquare;
    case "updated":
      return Pencil;
    default:
      return Activity;
  }
}

/**
 * Get a human-readable action label for display
 */
function getActionLabel(entry: ActivityLogEntry): string {
  const { action, field_name, old_value, new_value } = entry;

  switch (action) {
    case "created":
      return "created";
    case "deleted":
      return "deleted";
    case "status_changed":
      return `moved to ${new_value || "unknown"}`;
    case "archived":
      return "archived";
    case "unarchived":
      return "unarchived";
    case "commented":
      return "commented on";
    case "updated":
      if (field_name === "title") {
        return "renamed";
      }
      if (field_name === "description") {
        return old_value ? "updated description of" : "added description to";
      }
      if (field_name === "status") {
        return `moved to ${new_value || "unknown"}`;
      }
      return `updated ${field_name?.replace(/_/g, " ") || ""}`;
    default:
      return action;
  }
}

/**
 * Format a timestamp into a relative time string
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

const ActivityFeed = memo(function ActivityFeed({
  activities,
  loading,
}: {
  activities: ActivityLogEntry[];
  loading: boolean;
}) {
  const { toast } = useToast();

  const handleViewAllClick = useCallback(() => {
    toast("Activity page coming soon", "info");
  }, [toast]);

  return (
    <div className="card p-5 h-fit">
      <h3 className="text-[15px] font-semibold mb-4">Recent Activity</h3>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center">
          <Activity className="h-8 w-8 mx-auto text-foreground-muted mb-2" />
          <p className="text-sm text-foreground-muted">No recent activity</p>
          <p className="text-xs text-foreground-muted mt-1">
            Activity will appear here as you work on ideas
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((entry) => {
            const IconComponent = getActivityIconComponent(entry.action);
            const actionLabel = getActionLabel(entry);
            const title = entry.idea_title || "Unknown idea";
            const timeAgo = formatRelativeTime(entry.created_at);

            return (
              <Link
                key={entry.id}
                href={entry.idea_id ? `/dashboard/ideas?selected=${entry.idea_id}` : "/dashboard/ideas"}
                className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-0 hover:bg-bg-hover -mx-2 px-2 rounded transition-colors"
              >
                <span className="w-7 h-7 rounded-md bg-bg-tertiary flex items-center justify-center shrink-0">
                  <IconComponent className="h-3.5 w-3.5 text-foreground-muted" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">
                    <span className="text-foreground-muted">{actionLabel}</span>{" "}
                    <span className="font-medium truncate">{title}</span>
                  </div>
                  <div className="text-[11px] text-foreground-muted">{timeAgo}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <button
        onClick={handleViewAllClick}
        className="w-full mt-4 py-2.5 text-xs text-foreground-muted bg-bg-tertiary rounded-md hover:bg-bg-hover transition-colors"
      >
        View all activity →
      </button>
    </div>
  );
});
