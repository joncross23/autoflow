import { createClient } from "@/lib/supabase/client";
import type { DbTask, DbTaskInsert, DbTaskUpdate } from "@/types/database";

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
