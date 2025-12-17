export default function ProjectsPage() {
  return (
    <div className="p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-foreground-secondary">
            Track automation projects on Kanban boards
          </p>
        </div>
        <button className="btn btn-primary" disabled>
          + New Board
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
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold">No project boards yet</h2>
        <p className="mb-4 max-w-sm text-foreground-muted">
          Create a Kanban board to track your automation projects from idea to
          completion.
        </p>
        <p className="text-sm text-foreground-muted">
          Kanban boards coming in Phase 5
        </p>
      </div>
    </div>
  );
}
