"use client";

import { useState, useEffect } from "react";
import { Lightbulb, TrendingUp, CheckCircle, Clock, Loader2 } from "lucide-react";
import { StatCard, StatGrid, Progress } from "@/components/shared";
import { QuickCapture } from "@/components/ideas";
import { getIdeaCounts } from "@/lib/api/ideas";
import type { IdeaStatus } from "@/types/database";

export default function DashboardPage() {
  const [ideaCounts, setIdeaCounts] = useState<Record<IdeaStatus, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const counts = await getIdeaCounts();
      setIdeaCounts(counts);
    } catch (err) {
      console.error("Failed to load idea counts:", err);
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

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to AutoFlow. Capture ideas and track automation projects.
        </p>
      </header>

      {/* Quick Capture */}
      <div className="mb-8">
        <QuickCapture onSuccess={loadStats} />
      </div>

      {/* Stats */}
      <StatGrid columns={4} className="mb-8">
        <StatCard
          label="Total Ideas"
          value={loading ? "-" : totalIdeas.toString()}
          icon={Lightbulb}
        />
        <StatCard
          label="Evaluating"
          value={loading ? "-" : (ideaCounts?.evaluating || 0).toString()}
          icon={TrendingUp}
        />
        <StatCard
          label="Prioritised"
          value={loading ? "-" : (ideaCounts?.prioritised || 0).toString()}
          icon={CheckCircle}
        />
        <StatCard
          label="Converting"
          value={loading ? "-" : (ideaCounts?.converting || 0).toString()}
          icon={Clock}
        />
      </StatGrid>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ideas Pipeline */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Ideas Pipeline</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <PipelineItem
                label="New"
                count={ideaCounts?.new || 0}
                total={totalIdeas}
                color="blue"
              />
              <PipelineItem
                label="Evaluating"
                count={ideaCounts?.evaluating || 0}
                total={totalIdeas}
                color="orange"
              />
              <PipelineItem
                label="Prioritised"
                count={ideaCounts?.prioritised || 0}
                total={totalIdeas}
                color="purple"
              />
              <PipelineItem
                label="Converting"
                count={ideaCounts?.converting || 0}
                total={totalIdeas}
                color="emerald"
              />
            </div>
          )}
          {!loading && totalIdeas === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Start capturing ideas to see your pipeline here.
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              action="Phase completed"
              detail="Phase 2: Authentication"
              time="Today"
            />
            <ActivityItem
              action="Phase completed"
              detail="Phase 1: Theme Implementation"
              time="Today"
            />
            <ActivityItem
              action="Project created"
              detail="AutoFlow Development"
              time="Earlier"
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Activity will appear here as you use AutoFlow.
          </p>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="mt-8 card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Development Progress</h3>
          <span className="text-sm text-muted-foreground">Phase 3 of 8</span>
        </div>
        <Progress value={3} max={8} size="md" />
        <p className="mt-2 text-sm text-muted-foreground">
          Currently in <span className="text-primary font-medium">Phase 3: Idea Capture</span>
        </p>
      </div>
    </div>
  );
}

function PipelineItem({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "blue" | "orange" | "purple" | "emerald";
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorMap = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      <div className="progress h-1.5">
        <div
          className={`h-full rounded-full ${colorMap[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({
  action,
  detail,
  time,
}: {
  action: string;
  detail: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{action}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}
