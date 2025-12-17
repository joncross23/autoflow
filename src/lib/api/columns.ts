/**
 * Columns API
 * CRUD operations for project columns
 */

import { createClient } from "@/lib/supabase/client";
import type { DbColumn, DbColumnInsert, DbColumnUpdate } from "@/types/database";

/**
 * Get all columns for a project
 */
export async function getProjectColumns(projectId: string): Promise<DbColumn[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching columns:", error);
    throw new Error(`Failed to fetch columns: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single column by ID
 */
export async function getColumn(columnId: string): Promise<DbColumn | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("id", columnId)
    .single();

  if (error) {
    console.error("Error fetching column:", error);
    return null;
  }

  return data;
}

/**
 * Create a new column
 */
export async function createColumn(column: DbColumnInsert): Promise<DbColumn> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("columns")
    .insert({
      project_id: column.project_id,
      name: column.name,
      position: column.position,
      color: column.color || null,
      wip_limit: column.wip_limit || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating column:", error);
    throw new Error(`Failed to create column: ${error.message}`);
  }

  return data;
}

/**
 * Update a column
 */
export async function updateColumn(
  columnId: string,
  updates: DbColumnUpdate
): Promise<DbColumn> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("columns")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", columnId)
    .select()
    .single();

  if (error) {
    console.error("Error updating column:", error);
    throw new Error(`Failed to update column: ${error.message}`);
  }

  return data;
}

/**
 * Delete a column
 */
export async function deleteColumn(columnId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("columns").delete().eq("id", columnId);

  if (error) {
    console.error("Error deleting column:", error);
    throw new Error(`Failed to delete column: ${error.message}`);
  }
}

/**
 * Reorder columns within a project
 */
export async function reorderColumns(
  projectId: string,
  columnIds: string[]
): Promise<void> {
  const supabase = createClient();

  // Update each column's position
  const updates = columnIds.map((columnId, index) => ({
    id: columnId,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("columns")
      .update({ position: update.position, updated_at: update.updated_at })
      .eq("id", update.id)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error reordering columns:", error);
      throw new Error(`Failed to reorder columns: ${error.message}`);
    }
  }
}

/**
 * Get tasks grouped by column for a project
 */
export async function getProjectTasksByColumn(projectId: string): Promise<{
  columns: DbColumn[];
  tasksByColumn: Record<string, any[]>;
}> {
  const supabase = createClient();

  // Get columns
  const columns = await getProjectColumns(projectId);

  // Get all tasks for the project
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  // Group tasks by column_id
  const tasksByColumn: Record<string, any[]> = {};

  // Initialize empty arrays for each column
  columns.forEach((column) => {
    tasksByColumn[column.id] = [];
  });

  // Add tasks to their respective columns
  tasks?.forEach((task) => {
    if (task.column_id && tasksByColumn[task.column_id]) {
      tasksByColumn[task.column_id].push(task);
    }
  });

  return {
    columns,
    tasksByColumn,
  };
}
