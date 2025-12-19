import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Preset empty states for common scenarios */
export function NoIdeasEmptyState({ action }: { action?: ReactNode } = {}) {
  return (
    <EmptyState
      title="No ideas yet"
      description="Start capturing automation ideas. They'll appear here for evaluation and prioritisation."
      action={action}
    />
  );
}

export function NoProjectsEmptyState() {
  return (
    <EmptyState
      title="No project boards yet"
      description="Create a Kanban board to track your automation projects from idea to completion."
    />
  );
}

export function NoResultsEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      title="No results found"
      description={
        query
          ? `No matches for "${query}". Try a different search term.`
          : "No items match your current filters."
      }
    />
  );
}

export function ErrorEmptyState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title="Something went wrong"
      description={message || "An error occurred while loading. Please try again."}
      action={
        onRetry && (
          <button onClick={onRetry} className="btn btn-secondary">
            Try again
          </button>
        )
      }
    />
  );
}
