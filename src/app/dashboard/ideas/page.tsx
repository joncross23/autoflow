export default function IdeasPage() {
  return (
    <div className="p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-foreground-secondary">
            Capture and evaluate automation ideas
          </p>
        </div>
        <button className="btn btn-primary" disabled>
          + New Idea
        </button>
      </header>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-primary-muted p-4">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold">No ideas yet</h2>
        <p className="mb-4 max-w-sm text-foreground-muted">
          Start capturing automation ideas. They&apos;ll appear here for evaluation
          and prioritisation.
        </p>
        <p className="text-sm text-foreground-muted">
          Ideas capture coming in Phase 3
        </p>
      </div>
    </div>
  );
}
