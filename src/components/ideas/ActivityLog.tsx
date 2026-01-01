"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  Trash2,
  ArrowRight,
  Archive,
  ArchiveRestore,
  MessageSquare,
  Pencil,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  getIdeaActivity,
  ActivityLogEntry,
  ActivityAction,
  getActivityDescription,
} from "@/lib/api/activity";

interface ActivityLogProps {
  ideaId: string;
  maxItems?: number;
  /** Callback when activity count changes */
  onActivityCountChange?: (count: number) => void;
}

const ACTION_ICONS: Record<ActivityAction, React.ElementType> = {
  created: Plus,
  deleted: Trash2,
  status_changed: ArrowRight,
  archived: Archive,
  unarchived: ArchiveRestore,
  commented: MessageSquare,
  updated: Pencil,
};

const ACTION_COLORS: Record<ActivityAction, string> = {
  created: "text-green-400 bg-green-500/20",
  deleted: "text-red-400 bg-red-500/20",
  status_changed: "text-blue-400 bg-blue-500/20",
  archived: "text-slate-400 bg-slate-500/20",
  unarchived: "text-slate-400 bg-slate-500/20",
  commented: "text-cyan-400 bg-cyan-500/20",
  updated: "text-amber-400 bg-amber-500/20",
};

function ActivityItem({ entry }: { entry: ActivityLogEntry }) {
  const Icon = ACTION_ICONS[entry.action] || Activity;
  const colorClass = ACTION_COLORS[entry.action] || "text-muted-foreground bg-muted";

  return (
    <div className="flex gap-3 py-2">
      {/* Icon */}
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
          colorClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">{getActivityDescription(entry)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(entry.created_at)}
        </p>
      </div>
    </div>
  );
}

export function ActivityLog({ ideaId, maxItems = 10, onActivityCountChange }: ActivityLogProps) {
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIdeaActivity(ideaId, 50);
        setActivity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [ideaId]);

  // Notify parent of activity count changes
  useEffect(() => {
    onActivityCountChange?.(activity.length);
  }, [activity, onActivityCountChange]);

  const visibleActivity = expanded ? activity : activity.slice(0, maxItems);
  const hasMore = activity.length > maxItems;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-error py-4">{error}</p>
    );
  }

  if (activity.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">
          Activity{" "}
          <span className="text-muted-foreground font-normal">
            ({activity.length})
          </span>
        </h3>
      </div>

      {/* Activity List */}
      <div className="space-y-1 divide-y divide-border-subtle">
        {visibleActivity.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Show More/Less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show {activity.length - maxItems} more
            </>
          )}
        </button>
      )}
    </div>
  );
}
