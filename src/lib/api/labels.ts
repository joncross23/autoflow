/**
 * Labels API
 * CRUD operations for labels and label assignments
 */

import { createClient } from "@/lib/supabase/client";
import type {
  DbLabel,
  DbLabelInsert,
  DbLabelUpdate,
} from "@/types/database";

// Type for Supabase join results when selecting labels through junction tables
// Note: Supabase returns the joined relation as a single object (not array) when the FK relationship is correctly defined
interface LabelJoinRow {
  idea_id?: string;
  project_id?: string;
  task_id?: string;
  label_id?: string;
  labels: DbLabel | null;
}

// Type assertion helper for Supabase join results
type SupabaseLabelJoinResult = Array<{
  idea_id?: string;
  project_id?: string;
  task_id?: string;
  label_id?: string;
  labels: DbLabel | DbLabel[] | null;
}>;

// Helper to extract label from join result (handles both single object and array)
function extractLabel(labels: DbLabel | DbLabel[] | null): DbLabel | null {
  if (!labels) return null;
  return Array.isArray(labels) ? labels[0] ?? null : labels;
}
import { LABEL_COLORS } from "@/types/database";

/**
 * Get all labels for the current user
 * Auto-seeds 6 default color labels if user has none
 */
export async function getLabels(): Promise<DbLabel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("labels")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching labels:", error);
    throw new Error(`Failed to fetch labels: ${error.message}`);
  }

  // Auto-seed default labels if user has none
  if (!data || data.length === 0) {
    const seededLabels = await seedDefaultLabels();
    return seededLabels;
  }

  return data;
}

/**
 * Seed default color labels for new users
 * Creates 6 labels with colors only (no names)
 */
async function seedDefaultLabels(): Promise<DbLabel[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const defaultLabels = LABEL_COLORS.map((color) => ({
    user_id: user.id,
    name: "",
    color: color,
  }));

  const { data, error } = await supabase
    .from("labels")
    .insert(defaultLabels)
    .select();

  if (error) {
    console.error("Error seeding default labels:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single label by ID
 */
export async function getLabel(labelId: string): Promise<DbLabel | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("labels")
    .select("*")
    .eq("id", labelId)
    .single();

  if (error) {
    console.error("Error fetching label:", error);
    return null;
  }

  return data;
}

/**
 * Create a new label
 */
export async function createLabel(label: DbLabelInsert): Promise<DbLabel> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("labels")
    .insert({
      user_id: user.id,
      name: label.name,
      color: label.color,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating label:", error);
    throw new Error(`Failed to create label: ${error.message}`);
  }

  return data;
}

/**
 * Update a label
 */
export async function updateLabel(
  labelId: string,
  updates: DbLabelUpdate
): Promise<DbLabel> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("labels")
    .update(updates)
    .eq("id", labelId)
    .select()
    .single();

  if (error) {
    console.error("Error updating label:", error);
    throw new Error(`Failed to update label: ${error.message}`);
  }

  return data;
}

/**
 * Delete a label
 */
export async function deleteLabel(labelId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("labels").delete().eq("id", labelId);

  if (error) {
    console.error("Error deleting label:", error);
    throw new Error(`Failed to delete label: ${error.message}`);
  }
}

// ============================================
// IDEA LABELS
// ============================================

/**
 * Get all idea labels for the current user (bulk fetch)
 * Returns a map of idea_id -> labels[]
 */
export async function getAllIdeaLabels(): Promise<Record<string, DbLabel[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_labels")
    .select("idea_id, labels(*)");

  if (error) {
    console.error("Error fetching all idea labels:", error);
    return {};
  }

  const labelsMap: Record<string, DbLabel[]> = {};
  (data as unknown as SupabaseLabelJoinResult | null)?.forEach((row) => {
    if (row.idea_id) {
      if (!labelsMap[row.idea_id]) labelsMap[row.idea_id] = [];
      if (row.labels) {
        // Handle both single object and array cases (Supabase returns single object for to-one relations)
        const label = Array.isArray(row.labels) ? row.labels[0] : row.labels;
        if (label) labelsMap[row.idea_id].push(label);
      }
    }
  });

  return labelsMap;
}

/**
 * Get labels for an idea
 */
export async function getIdeaLabels(ideaId: string): Promise<DbLabel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_labels")
    .select("label_id, labels(*)")
    .eq("idea_id", ideaId);

  if (error) {
    console.error("Error fetching idea labels:", error);
    throw new Error(`Failed to fetch idea labels: ${error.message}`);
  }

  return (data as unknown as SupabaseLabelJoinResult | null)
    ?.map((row) => extractLabel(row.labels))
    .filter((label): label is DbLabel => label !== null) || [];
}

/**
 * Add a label to an idea
 */
export async function addIdeaLabel(
  ideaId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("idea_labels").insert({
    idea_id: ideaId,
    label_id: labelId,
  });

  if (error) {
    console.error("Error adding idea label:", error);
    throw new Error(`Failed to add label to idea: ${error.message}`);
  }
}

/**
 * Remove a label from an idea
 */
export async function removeIdeaLabel(
  ideaId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("idea_labels")
    .delete()
    .eq("idea_id", ideaId)
    .eq("label_id", labelId);

  if (error) {
    console.error("Error removing idea label:", error);
    throw new Error(`Failed to remove label from idea: ${error.message}`);
  }
}

// ============================================
// PROJECT LABELS
// ============================================

/**
 * Get labels for a project
 */
export async function getProjectLabels(projectId: string): Promise<DbLabel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("project_labels")
    .select("label_id, labels(*)")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project labels:", error);
    throw new Error(`Failed to fetch project labels: ${error.message}`);
  }

  return (data as unknown as SupabaseLabelJoinResult | null)
    ?.map((row) => extractLabel(row.labels))
    .filter((label): label is DbLabel => label !== null) || [];
}

/**
 * Add a label to a project
 */
export async function addProjectLabel(
  projectId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("project_labels").insert({
    project_id: projectId,
    label_id: labelId,
  });

  if (error) {
    console.error("Error adding project label:", error);
    throw new Error(`Failed to add label to project: ${error.message}`);
  }
}

/**
 * Remove a label from a project
 */
export async function removeProjectLabel(
  projectId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("project_labels")
    .delete()
    .eq("project_id", projectId)
    .eq("label_id", labelId);

  if (error) {
    console.error("Error removing project label:", error);
    throw new Error(`Failed to remove label from project: ${error.message}`);
  }
}

// ============================================
// TASK LABELS
// ============================================

/**
 * Get labels for a task
 */
export async function getTaskLabels(taskId: string): Promise<DbLabel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("task_labels")
    .select("label_id, labels(*)")
    .eq("task_id", taskId);

  if (error) {
    console.error("Error fetching task labels:", error);
    throw new Error(`Failed to fetch task labels: ${error.message}`);
  }

  return (data as unknown as SupabaseLabelJoinResult | null)
    ?.map((row) => extractLabel(row.labels))
    .filter((label): label is DbLabel => label !== null) || [];
}

/**
 * Add a label to a task
 */
export async function addTaskLabel(
  taskId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("task_labels").insert({
    task_id: taskId,
    label_id: labelId,
  });

  if (error) {
    console.error("Error adding task label:", error);
    throw new Error(`Failed to add label to task: ${error.message}`);
  }
}

/**
 * Remove a label from a task
 */
export async function removeTaskLabel(
  taskId: string,
  labelId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("task_labels")
    .delete()
    .eq("task_id", taskId)
    .eq("label_id", labelId);

  if (error) {
    console.error("Error removing task label:", error);
    throw new Error(`Failed to remove label from task: ${error.message}`);
  }
}
