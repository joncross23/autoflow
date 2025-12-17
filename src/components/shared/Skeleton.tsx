import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

/** Skeleton for a card layout */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("card space-y-3", className)}>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/** Skeleton for a stat card */
export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("stat-card", className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

/** Skeleton for an avatar */
export function AvatarSkeleton({
  size = "md",
  className,
}: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

/** Skeleton for a table row */
export function TableRowSkeleton({
  columns = 4,
  className,
}: SkeletonProps & { columns?: number }) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/** Multiple skeletons for a list */
interface ListSkeletonProps extends SkeletonProps {
  count?: number;
  ItemSkeleton?: React.ComponentType<SkeletonProps>;
}

export function ListSkeleton({
  count = 3,
  ItemSkeleton = CardSkeleton,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}
