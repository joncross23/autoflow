import { Lightbulb, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { StatCard, StatGrid, Progress } from "@/components/shared";

export default function DashboardPage() {
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
        <div className="card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Quick Capture</span>
            <span className="badge badge-primary text-[10px]">Cmd/Ctrl+K</span>
          </div>
          <input
            type="text"
            placeholder="Type an automation idea and press Enter..."
            className="input w-full"
            disabled
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Quick capture coming in Phase 3
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatGrid columns={4} className="mb-8">
        <StatCard
          label="Total Ideas"
          value="0"
          icon={Lightbulb}
          change={{ value: 0, label: "this week" }}
        />
        <StatCard
          label="In Progress"
          value="0"
          icon={TrendingUp}
        />
        <StatCard
          label="Completed"
          value="0"
          icon={CheckCircle}
        />
        <StatCard
          label="Hours Saved"
          value="0"
          icon={Clock}
          change={{ value: 0, label: "this month" }}
        />
      </StatGrid>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ideas Pipeline */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Ideas Pipeline</h2>
          <div className="space-y-4">
            <PipelineItem label="New" count={0} total={0} color="blue" />
            <PipelineItem label="Evaluating" count={0} total={0} color="orange" />
            <PipelineItem label="Prioritised" count={0} total={0} color="purple" />
            <PipelineItem label="Converting" count={0} total={0} color="emerald" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Start capturing ideas to see your pipeline here.
          </p>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              action="Project created"
              detail="AutoFlow Development"
              time="Just now"
            />
            <ActivityItem
              action="Phase completed"
              detail="Phase 0: Foundation"
              time="Today"
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
          <span className="text-sm text-muted-foreground">Phase 1 of 8</span>
        </div>
        <Progress value={1} max={8} size="md" />
        <p className="mt-2 text-sm text-muted-foreground">
          Currently in <span className="text-primary font-medium">Phase 1: Theme Implementation</span>
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
