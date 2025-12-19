export default function AppearanceLoading() {
  return (
    <div className="space-y-8">
      {/* Theme Selection Skeleton */}
      <section>
        <div className="skeleton mb-1 h-6 w-20" />
        <div className="skeleton mb-4 h-4 w-48" />

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <div className="skeleton h-28" />
              <div className="border-t p-3">
                <div className="skeleton mb-1 h-4 w-24" />
                <div className="skeleton h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mode Selection Skeleton */}
      <section>
        <div className="skeleton mb-1 h-6 w-28" />
        <div className="skeleton mb-4 h-4 w-64" />

        <div className="skeleton h-10 w-72 rounded-lg" />
      </section>

      {/* Accent Color Selection Skeleton */}
      <section>
        <div className="skeleton mb-1 h-6 w-32" />
        <div className="skeleton mb-4 h-4 w-56" />

        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="skeleton h-3 w-12" />
            </div>
          ))}
        </div>
      </section>

      {/* Preview Skeleton */}
      <section>
        <div className="skeleton mb-1 h-6 w-20" />
        <div className="skeleton mb-4 h-4 w-52" />

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div>
              <div className="skeleton mb-1 h-4 w-32" />
              <div className="skeleton h-3 w-48" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="skeleton h-9 w-28 rounded-md" />
            <div className="skeleton h-9 w-24 rounded-md" />
            <div className="skeleton h-9 w-20 rounded-md" />
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-5 w-16 rounded-full" />
            ))}
          </div>

          <div className="skeleton h-2 w-full rounded-full" />
        </div>
      </section>
    </div>
  );
}
