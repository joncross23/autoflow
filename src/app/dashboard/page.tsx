"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  FolderKanban,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { QuickCapture } from "@/components/ideas";
import { getIdeaCounts } from "@/lib/api/ideas";
import { getProjects } from "@/lib/api/projects";
import type { IdeaStatus, DbProject } from "@/types/database";

export default function DashboardPage() {
  const [ideaCounts, setIdeaCounts] = useState<Record<IdeaStatus, number> | null>(null);
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const [counts, projectsData] = await Promise.all([
        getIdeaCounts(),
        getProjects(),
      ]);
      setIdeaCounts(counts);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalIdeas = ideaCounts
    ? Object.values(ideaCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  const activeIdeas = ideaCounts
    ? (ideaCounts.new || 0) +
      (ideaCounts.evaluating || 0) +
      (ideaCounts.prioritised || 0) +
      (ideaCounts.converting || 0)
    : 0;

  const activeProjects = projects.filter(
    (p) => p.status !== "done" && p.status !== "archived"
  );
  const completedProjects = projects.filter((p) => p.status === "done");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-foreground-muted mt-1">
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
          label="Active Ideas"
          value={loading ? "-" : activeIdeas.toString()}
          icon={<Lightbulb className="h-5 w-5" />}
          trend={12}
          color="#3B82F6"
        />
        <DashboardStatCard
          label="Active Projects"
          value={loading ? "-" : activeProjects.length.toString()}
          icon={<FolderKanban className="h-5 w-5" />}
          trend={25}
          color="#8B5CF6"
        />
        <DashboardStatCard
          label="Completed"
          value={loading ? "-" : completedProjects.length.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={8}
          color="#22C55E"
        />
        <DashboardStatCard
          label="Hours Saved"
          value="127.5"
          icon={<Clock className="h-5 w-5" />}
          trend={15}
          color="#F59E0B"
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
              <h3 className="text-[15px] font-semibold mb-4">Completed Projects</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "This Week", value: "2" },
                  { label: "This Month", value: "5" },
                  { label: "All Time", value: completedProjects.length.toString() },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-3 bg-bg-tertiary rounded-lg"
                  >
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className="text-[11px] text-foreground-muted">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold">Active Projects</h3>
              <Link
                href="/dashboard/projects"
                className="text-[13px] font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-foreground-muted text-sm">No active projects yet.</p>
                <Link href="/dashboard/projects" className="btn btn-primary mt-4 inline-flex">
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {activeProjects.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}

function DashboardStatCard({
  label,
  value,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}) {
  return (
    <div className="card p-5">
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
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              trend >= 0 ? "bg-success/15 text-success" : "bg-error/15 text-error"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function PipelineWidget({
  ideaCounts,
  loading,
}: {
  ideaCounts: Record<IdeaStatus, number> | null;
  loading: boolean;
}) {
  const stages = [
    { key: "new", label: "New", color: "#3B82F6" },
    { key: "evaluating", label: "Evaluating", color: "#F59E0B" },
    { key: "prioritised", label: "Prioritised", color: "#8B5CF6" },
    { key: "converting", label: "Converting", color: "#10B981" },
  ] as const;

  const total = ideaCounts
    ? stages.reduce((sum, s) => sum + (ideaCounts[s.key as IdeaStatus] || 0), 0)
    : 0;

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold">Ideas Pipeline</h3>
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
                <div
                  key={stage.key}
                  style={{
                    flex: count || 0.01,
                    backgroundColor: stage.color,
                  }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {stages.map((stage) => (
              <div key={stage.key} className="flex items-center gap-2">
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: DbProject }) {
  const priorityColors: Record<string, string> = {
    high: "#EF4444",
    critical: "#EF4444",
    medium: "#F59E0B",
    low: "#22C55E",
  };

  const daysLeft = project.due_date
    ? Math.ceil(
        (new Date(project.due_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  // Simulate progress (in real app, calculate from tasks)
  const progress = Math.floor(Math.random() * 80) + 10;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="card p-4 hover:border-primary transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-1 h-10 rounded shrink-0"
          style={{ backgroundColor: priorityColors[project.priority] || "#64748B" }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {project.title}
          </h4>
          <div
            className={`text-xs ${
              isOverdue
                ? "text-error"
                : isUrgent
                ? "text-warning"
                : "text-foreground-muted"
            }`}
          >
            {daysLeft !== null
              ? isOverdue
                ? `${Math.abs(daysLeft)}d overdue`
                : `${daysLeft}d remaining`
              : "No due date"}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-foreground-muted">Progress</span>
          <span className="text-[11px] font-semibold">{progress}%</span>
        </div>
        <div className="h-1 bg-bg-tertiary rounded overflow-hidden">
          <div
            className={`h-full rounded ${
              progress >= 80 ? "bg-success" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-foreground-muted">
        {project.status.replace("_", " ")}
      </div>
    </Link>
  );
}

function ActivityFeed() {
  const activities = [
    { id: 1, icon: Lightbulb, action: "captured", title: "New automation idea", time: "5m ago" },
    { id: 2, icon: CheckCircle, action: "completed", title: "Set up email triggers", time: "23m ago" },
    { id: 3, icon: FolderKanban, action: "updated", title: "Email Automation System", time: "1h ago" },
    { id: 4, icon: Sparkles, action: "analysed", title: "3 ideas evaluated", time: "2h ago" },
    { id: 5, icon: TrendingUp, action: "converted", title: "CRM data sync → Project", time: "3h ago" },
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
