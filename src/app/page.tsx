import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Auto<span className="text-primary">Flow</span>
        </h1>
        <p className="mb-8 text-lg text-foreground-secondary">
          AI & Automation Discovery Platform
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
          <FeatureCard
            title="Capture"
            description="Rapid idea collection via text, voice, or forms"
          />
          <FeatureCard
            title="Evaluate"
            description="AI-assisted scoring and prioritisation"
          />
          <FeatureCard
            title="Execute"
            description="Structured project tracking with Kanban boards"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card text-left">
      <h3 className="mb-2 font-semibold text-primary">{title}</h3>
      <p className="text-sm text-foreground-secondary">{description}</p>
    </div>
  );
}
