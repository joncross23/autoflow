export default function ProjectsLoading() {
  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <div className="skeleton h-8 w-28 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-10 w-32 rounded-lg" />
      </header>

      {/* Kanban board skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-4 h-full">
          {/* 5 columns */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-[280px] bg-bg-secondary rounded-lg p-4"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-5 w-6 rounded-full" />
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <KanbanCardSkeleton />
                {i < 3 && <KanbanCardSkeleton />}
                {i === 0 && <KanbanCardSkeleton />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCardSkeleton() {
  return (
    <div className="card p-3 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}
