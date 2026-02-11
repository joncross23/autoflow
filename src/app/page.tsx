import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Idea<span className="text-primary">Tracker</span>
        </h1>
        <p className="mb-8 text-lg text-foreground-secondary">
          Capture, score, and deliver your best ideas
        </p>
        <p className="mb-8 text-foreground-muted">
          Capture fast. Evaluate deep. Execute systematically.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="btn btn-primary px-8 py-3 text-base"
          >
            Open Dashboard
          </Link>
          <Link
            href="/settings"
            className="btn btn-secondary px-8 py-3 text-base"
          >
            Settings
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <Link href="/dashboard/ideas" className="card text-left hover:border-primary transition-colors">
            <h3 className="mb-2 font-semibold text-primary">Ideas</h3>
            <p className="text-sm text-foreground-secondary">Capture and evaluate automation opportunities</p>
          </Link>
          <Link href="/dashboard/tasks" className="card text-left hover:border-primary transition-colors">
            <h3 className="mb-2 font-semibold text-primary">Tasks</h3>
            <p className="text-sm text-foreground-secondary">Kanban board for tracking implementation</p>
          </Link>
          <Link href="/dashboard/matrix" className="card text-left hover:border-primary transition-colors">
            <h3 className="mb-2 font-semibold text-primary">Matrix</h3>
            <p className="text-sm text-foreground-secondary">Prioritise ideas by impact and effort</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

