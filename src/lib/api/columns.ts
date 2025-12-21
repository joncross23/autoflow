/**
 * Columns API
 * V1.0: Global columns (user-scoped) for task board
 * Legacy: Project-scoped columns kept for migration compatibility
 */

import { createClient } from "@/lib/supabase/client";
import type { DbColumn, DbColumnInsert, DbColumnUpdate, ColumnColor } from "@/types/database";

// Default columns for new users
const DEFAULT_COLUMNS: { name: string; color: ColumnColor; position: number }[] = [
  { name: "Backlog", color: "slate", position: 0 },
  { name: "To Do", color: "blue", position: 1 },
  { name: "In Progress", color: "yellow", position: 2 },
  { name: "Review", color: "purple", position: 3 },
  { name: "Done", color: "green", position: 4 },
];

// ============================================
// V1.0: Global Columns (User-scoped)
// ============================================

/**
 * Get all global columns for the current user
 */
export async function getGlobalColumns(): Promise<DbColumn[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("user_id", user.id)
    .is("project_id", null)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching global columns:", error);
    throw new Error(`Failed to fetch columns: ${error.message}`);
  }

  // Seed default columns if none exist
  if (!data || data.length === 0) {
    return await seedDefaultColumns(user.id);
  }

  return data;
}

/**
 * Seed default columns for a new user
 */
async function seedDefaultColumns(userId: string): Promise<DbColumn[]> {
  const supabase = createClient();

  const columnsToInsert = DEFAULT_COLUMNS.map((col) => ({
    user_id: userId,
    project_id: null,
    name: col.name,
    color: col.color,
    position: col.position,
  }));

  const { data, error } = await supabase
    .from("columns")
    .insert(columnsToInsert)
    .select();

  if (error) {
    console.error("Error seeding default columns:", error);
    throw new Error(`Failed to seed default columns: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a global column
 */
export async function createGlobalColumn(
  name: string,
  color?: ColumnColor,
  position?: number
): Promise<DbColumn> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get current max position if not specified
  if (position === undefined) {
    const columns = await getGlobalColumns();
    position = columns.length;
  }

  const { data, error } = await supabase
    .from("columns")
    .insert({
      user_id: user.id,
      project_id: null,
      name,
      color: color || "slate",
      position,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating global column:", error);
    throw new Error(`Failed to create column: ${error.message}`);
  }

  return data;
}

/**
 * Reorder global columns for current user
 */
export async function reorderGlobalColumns(columnIds: string[]): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  for (let i = 0; i < columnIds.length; i++) {
    const { error } = await supabase
      .from("columns")
      .update({ position: i, updated_at: new Date().toISOString() })
      .eq("id", columnIds[i])
      .eq("user_id", user.id);

    if (error) {
      console.error("Error reordering columns:", error);
      throw new Error(`Failed to reorder columns: ${error.message}`);
    }
  }
}

/**
 * Get all tasks grouped by column (global task board)
 */
export async function getDeliveryBoardData(ideaIds?: string[]): Promise<{
  columns: DbColumn[];
  tasksByColumn: Record<string, any[]>;
}> {
  const supabase = createClient();

  // Get global columns
  const columns = await getGlobalColumns();

  // Build tasks query
  let query = supabase
    .from("tasks")
    .select("*")
    .order("position", { ascending: true });

  // Filter by idea_ids if provided
  if (ideaIds && ideaIds.length > 0) {
    query = query.in("idea_id", ideaIds);
  }

  const { data: tasks, error } = await query;

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
    } else {
      // Tasks without a column go to first column (Backlog)
      const firstColumn = columns[0];
      if (firstColumn) {
        tasksByColumn[firstColumn.id].push(task);
      }
    }
  });

  return {
    columns,
    tasksByColumn,
  };
}

// ============================================
// Legacy: Project-scoped columns
// ============================================

/**
 * @deprecated Use getGlobalColumns() for v1.0
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
 * Create a new column (legacy - for project)
 */
export async function createColumn(column: DbColumnInsert): Promise<DbColumn> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("columns")
    .insert({
      project_id: column.project_id,
      user_id: column.user_id,
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
 * @deprecated Use reorderGlobalColumns() for v1.0
 * Reorder columns within a project
 */
export async function reorderColumns(
  projectId: string,
  columnIds: string[]
): Promise<void> {
  const supabase = createClient();

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
 * @deprecated Use getDeliveryBoardData() for v1.0
 * Get tasks grouped by column for a project
 */
export async function getProjectTasksByColumn(projectId: string): Promise<{
  columns: DbColumn[];
  tasksByColumn: Record<string, any[]>;
}> {
  const supabase = createClient();

  const columns = await getProjectColumns(projectId);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const tasksByColumn: Record<string, any[]> = {};

  columns.forEach((column) => {
    tasksByColumn[column.id] = [];
  });

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
