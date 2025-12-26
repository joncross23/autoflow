import { createClient } from "@/lib/supabase/client";
import type { DbTask, DbTaskInsert, DbTaskUpdate } from "@/types/database";

/**
 * Fetch all tasks for the current user (across all projects)
 * Used for linking tasks together
 */
export async function getAllTasks(): Promise<DbTask[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100); // Limit to most recent 100 tasks

  if (error) {
    console.error("Error fetching all tasks:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data || [];
}

export async function getTasksForProject(projectId: string): Promise<DbTask[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask[];
}

export async function createTask(task: DbTaskInsert): Promise<DbTask> {
  const supabase = createClient();

  // Get max position - use column_id if available, otherwise project_id
  let maxPosQuery = supabase
    .from("tasks")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (task.column_id) {
    maxPosQuery = maxPosQuery.eq("column_id", task.column_id);
  } else if (task.project_id) {
    maxPosQuery = maxPosQuery.eq("project_id", task.project_id);
  }

  const { data: maxPosData } = await maxPosQuery.maybeSingle();

  const nextPosition = maxPosData ? maxPosData.position + 1 : 0;

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...task, position: nextPosition })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask;
}

export async function updateTask(
  id: string,
  updates: DbTaskUpdate
): Promise<DbTask> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask;
}

export async function toggleTask(id: string): Promise<DbTask> {
  const supabase = createClient();

  // Get current state
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("completed")
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    throw new Error("Task not found");
  }

  // Toggle
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed: !task.completed })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Archive a task (soft delete)
 * Sets the task as completed and moves it out of view
 */
export async function archiveTask(id: string): Promise<DbTask> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update({ completed: true, column_id: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask;
}

/**
 * Duplicate a task (creates a copy with "(Copy)" suffix)
 */
export async function duplicateTask(id: string): Promise<DbTask> {
  const supabase = createClient();

  // Fetch original task
  const { data: original, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    throw new Error("Task not found");
  }

  // Guard against duplicating archived tasks (no column_id)
  if (!original.column_id) {
    throw new Error("Cannot duplicate an archived task - restore it first");
  }

  // Get max position in the same column
  const { data: maxPosData } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", original.column_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = maxPosData ? maxPosData.position + 1 : 0;

  // Create copy (excluding id, created_at, updated_at which are auto-generated)
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      idea_id: original.idea_id,
      project_id: original.project_id,
      column_id: original.column_id,
      title: `${original.title} (Copy)`,
      description: original.description,
      completed: false, // New copy starts as incomplete
      position: nextPosition,
      due_date: original.due_date,
      priority: original.priority,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbTask;
}
