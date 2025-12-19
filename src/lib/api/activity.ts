/**
 * Activity Log API
 * V1.2: Track and display idea/task history
 */

import { createClient } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  idea_id: string | null;
  task_id: string | null;
  action: ActivityAction;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined fields
  idea_title?: string;
  user_email?: string;
}

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "archived"
  | "unarchived"
  | "commented";

// ============================================
// Read Operations
// ============================================

/**
 * Get activity log for a specific idea
 */
export async function getIdeaActivity(
  ideaId: string,
  limit = 50
): Promise<ActivityLogEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get activity log for a specific task
 */
export async function getTaskActivity(
  taskId: string,
  limit = 50
): Promise<ActivityLogEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get recent activity for the current user (dashboard feed)
 */
export async function getRecentActivity(limit = 50): Promise<ActivityLogEntry[]> {
  const supabase = createClient();

  // Get activity with idea titles joined
  const { data, error } = await supabase
    .from("activity_log")
    .select(`
      *,
      ideas:idea_id (title)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  // Transform the joined data
  return (data || []).map((entry) => ({
    ...entry,
    idea_title: entry.ideas?.title || null,
    ideas: undefined,
  }));
}

/**
 * Get activity count for an idea
 */
export async function getIdeaActivityCount(ideaId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("activity_log")
    .select("*", { count: "exact", head: true })
    .eq("idea_id", ideaId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get a human-readable description of an activity entry
 */
export function getActivityDescription(entry: ActivityLogEntry): string {
  const { action, field_name, old_value, new_value, metadata } = entry;

  switch (action) {
    case "created":
      return `Created idea "${metadata?.title || "Untitled"}"`;

    case "deleted":
      return `Deleted idea "${metadata?.title || "Unknown"}"`;

    case "status_changed":
      return `Changed status from ${formatValue(old_value)} to ${formatValue(new_value)}`;

    case "archived":
      return "Archived this idea";

    case "unarchived":
      return "Unarchived this idea";

    case "commented":
      return "Added a comment";

    case "updated":
      if (field_name === "title") {
        return `Changed title from "${old_value}" to "${new_value}"`;
      }
      if (field_name === "description") {
        return old_value ? "Updated description" : "Added description";
      }
      if (field_name === "horizon") {
        return `Changed horizon from ${formatValue(old_value)} to ${formatValue(new_value)}`;
      }
      if (field_name === "effort_estimate") {
        return `Changed effort from ${formatValue(old_value)} to ${formatValue(new_value)}`;
      }
      if (field_name === "rice_score") {
        return `Updated RICE score to ${new_value}`;
      }
      return `Updated ${field_name?.replace(/_/g, " ") || "idea"}`;

    default:
      return `${action} ${field_name || ""}`.trim();
  }
}

function formatValue(value: string | null): string {
  if (!value || value === "null") return "none";
  return value;
}

/**
 * Get icon name for an activity action
 */
export function getActivityIcon(action: ActivityAction): string {
  switch (action) {
    case "created":
      return "plus";
    case "deleted":
      return "trash";
    case "status_changed":
      return "arrow-right";
    case "archived":
      return "archive";
    case "unarchived":
      return "archive-restore";
    case "commented":
      return "message-square";
    case "updated":
      return "pencil";
    default:
      return "activity";
  }
}

/**
 * Get color class for an activity action
 */
export function getActivityColor(action: ActivityAction): string {
  switch (action) {
    case "created":
      return "text-green-500";
    case "deleted":
      return "text-red-500";
    case "status_changed":
      return "text-blue-500";
    case "archived":
      return "text-slate-500";
    case "unarchived":
      return "text-slate-500";
    case "commented":
      return "text-purple-500";
    case "updated":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
  }
}
