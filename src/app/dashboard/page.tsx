"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { QuickCapture } from "@/components/ideas";
import { getIdeaCounts, getIdeas } from "@/lib/api/ideas";
import { StatusBadge } from "@/components/ideas/StatusBadge";
import type { IdeaStatus, DbIdea } from "@/types/database";

export default function DashboardPage() {
  const [ideaCounts, setIdeaCounts] = useState<Record<IdeaStatus, number> | null>(null);
  const [activeIdeas, setActiveIdeas] = useState<DbIdea[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const [counts, ideas] = await Promise.all([
        getIdeaCounts(),
        getIdeas({ status: ["accepted", "doing"], archived: false }),
      ]);
      setIdeaCounts(counts);
      setActiveIdeas(ideas);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          href="/dashboard/delivery"
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
                  { label: "This Week", value: "2", href: "/dashboard/ideas?status=complete&period=week" },
                  { label: "This Month", value: "5", href: "/dashboard/ideas?status=complete&period=month" },
                  { label: "All Time", value: doneCount.toString(), href: "/dashboard/ideas?status=complete" },
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
                href="/dashboard/delivery"
                className="text-[13px] font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Delivery Board <ArrowRight className="h-3.5 w-3.5" />
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
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({
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
}

function PipelineWidget({
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
    { key: "doing", label: "In Progress", color: "#10B981", href: "/dashboard/delivery" },
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
}

function IdeaCard({ idea }: { idea: DbIdea }) {
  const effortColors: Record<string, string> = {
    trivial: "#22C55E",
    small: "#22C55E",
    medium: "#F59E0B",
    large: "#EF4444",
    xlarge: "#EF4444",
  };

  return (
    <Link
      href={`/dashboard/ideas?selected=${idea.id}`}
      className="card p-4 hover:border-primary transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-1 h-10 rounded shrink-0"
          style={{ backgroundColor: effortColors[idea.effort_estimate || "medium"] || "#64748B" }}
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
}

function ActivityFeed() {
  const activities = [
    { id: 1, icon: Lightbulb, action: "captured", title: "New automation idea", time: "5m ago" },
    { id: 2, icon: CheckCircle, action: "completed", title: "Set up email triggers", time: "23m ago" },
    { id: 3, icon: ListTodo, action: "updated", title: "Email Automation System", time: "1h ago" },
    { id: 4, icon: Sparkles, action: "analysed", title: "3 ideas evaluated", time: "2h ago" },
    { id: 5, icon: TrendingUp, action: "accepted", title: "CRM data sync idea", time: "3h ago" },
    { id: 6, icon: MessageSquare, action: "commented", title: "on Invoice Processing", time: "4h ago" },
    { id: 7, icon: CheckCircle, action: "completed", title: "Design API endpoints", time: "5h ago" },
  ];

  return (
    <div className="card p-5 h-fit">
      <h3 className="text-[15px] font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-0">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-0"
          >
            <span className="w-7 h-7 rounded-md bg-bg-tertiary flex items-center justify-center shrink-0">
              <item.icon className="h-3.5 w-3.5 text-foreground-muted" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px]">
                <span className="text-foreground-muted">{item.action}</span>{" "}
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="text-[11px] text-foreground-muted">{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2.5 text-xs text-foreground-muted bg-bg-tertiary rounded-md hover:bg-bg-hover transition-colors">
        View all activity →
      </button>
    </div>
  );
}
