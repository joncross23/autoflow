import { CardSkeleton } from "@/components/shared";

export default function IdeasLoading() {
  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="skeleton h-8 w-24 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-10 w-28 rounded-lg" />
      </header>

      {/* Filters skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="skeleton h-10 flex-1 rounded-lg" />
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>

      {/* Ideas grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
