import { StatCardSkeleton, CardSkeleton } from "@/components/shared";

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-4 w-64" />
      </header>

      {/* Quick Capture skeleton */}
      <div className="mb-8">
        <div className="card">
          <div className="skeleton h-10 w-full" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  );
}
