export default function DashboardPage() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-foreground-secondary">
          Welcome to AutoFlow. Capture ideas and track automation projects.
        </p>
      </header>

      {/* Quick Capture placeholder */}
      <div className="mb-8">
        <div className="card">
          <input
            type="text"
            placeholder="Quick capture: Type an idea and press Enter..."
            className="input w-full"
            disabled
          />
          <p className="mt-2 text-sm text-foreground-muted">
            Quick capture coming in Phase 3
          </p>
        </div>
      </div>

      {/* Stats grid placeholder */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Ideas" value="0" />
        <StatCard title="In Progress" value="0" />
        <StatCard title="Completed" value="0" />
        <StatCard title="Hours Saved" value="0" />
      </div>

      {/* Content placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Ideas Pipeline</h2>
          <p className="text-foreground-muted">No ideas yet. Start capturing!</p>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <p className="text-foreground-muted">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-foreground-secondary">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
