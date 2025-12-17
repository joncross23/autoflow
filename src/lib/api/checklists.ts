/**
 * Checklists API
 * CRUD operations for checklists and checklist items
 */

import { createClient } from "@/lib/supabase/client";
import type {
  DbChecklist,
  DbChecklistInsert,
  DbChecklistUpdate,
  DbChecklistItem,
  DbChecklistItemInsert,
  DbChecklistItemUpdate,
} from "@/types/database";

// ============================================
// CHECKLISTS
// ============================================

/**
 * Get all checklists for a task
 */
export async function getTaskChecklists(taskId: string): Promise<DbChecklist[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("task_id", taskId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching checklists:", error);
    throw new Error(`Failed to fetch checklists: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single checklist by ID
 */
export async function getChecklist(checklistId: string): Promise<DbChecklist | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("id", checklistId)
    .single();

  if (error) {
    console.error("Error fetching checklist:", error);
    return null;
  }

  return data;
}

/**
 * Create a new checklist
 */
export async function createChecklist(
  checklist: DbChecklistInsert
): Promise<DbChecklist> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklists")
    .insert({
      task_id: checklist.task_id,
      title: checklist.title,
      position: checklist.position,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating checklist:", error);
    throw new Error(`Failed to create checklist: ${error.message}`);
  }

  return data;
}

/**
 * Update a checklist
 */
export async function updateChecklist(
  checklistId: string,
  updates: DbChecklistUpdate
): Promise<DbChecklist> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklists")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", checklistId)
    .select()
    .single();

  if (error) {
    console.error("Error updating checklist:", error);
    throw new Error(`Failed to update checklist: ${error.message}`);
  }

  return data;
}

/**
 * Delete a checklist
 */
export async function deleteChecklist(checklistId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("id", checklistId);

  if (error) {
    console.error("Error deleting checklist:", error);
    throw new Error(`Failed to delete checklist: ${error.message}`);
  }
}

// ============================================
// CHECKLIST ITEMS
// ============================================

/**
 * Get all items for a checklist
 */
export async function getChecklistItems(
  checklistId: string
): Promise<DbChecklistItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("checklist_id", checklistId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching checklist items:", error);
    throw new Error(`Failed to fetch checklist items: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single checklist item by ID
 */
export async function getChecklistItem(
  itemId: string
): Promise<DbChecklistItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error) {
    console.error("Error fetching checklist item:", error);
    return null;
  }

  return data;
}

/**
 * Create a new checklist item
 */
export async function createChecklistItem(
  item: DbChecklistItemInsert
): Promise<DbChecklistItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      checklist_id: item.checklist_id,
      title: item.title,
      done: item.done ?? false,
      position: item.position,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating checklist item:", error);
    throw new Error(`Failed to create checklist item: ${error.message}`);
  }

  return data;
}

/**
 * Create multiple checklist items at once
 * Useful for multi-line paste
 */
export async function createChecklistItems(
  checklistId: string,
  titles: string[]
): Promise<DbChecklistItem[]> {
  const supabase = createClient();

  // Get current max position
  const { data: existingItems } = await supabase
    .from("checklist_items")
    .select("position")
    .eq("checklist_id", checklistId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = existingItems?.[0]?.position ?? -1;

  // Create items with sequential positions
  const items = titles.map((title, index) => ({
    checklist_id: checklistId,
    title: title.trim(),
    done: false,
    position: startPosition + index + 1,
  }));

  const { data, error } = await supabase
    .from("checklist_items")
    .insert(items)
    .select();

  if (error) {
    console.error("Error creating checklist items:", error);
    throw new Error(`Failed to create checklist items: ${error.message}`);
  }

  return data || [];
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(
  itemId: string,
  updates: DbChecklistItemUpdate
): Promise<DbChecklistItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("Error updating checklist item:", error);
    throw new Error(`Failed to update checklist item: ${error.message}`);
  }

  return data;
}

/**
 * Toggle a checklist item's done status
 */
export async function toggleChecklistItem(
  itemId: string
): Promise<DbChecklistItem> {
  const supabase = createClient();

  // Get current state
  const current = await getChecklistItem(itemId);
  if (!current) {
    throw new Error("Checklist item not found");
  }

  // Toggle done status
  const { data, error } = await supabase
    .from("checklist_items")
    .update({
      done: !current.done,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("Error toggling checklist item:", error);
    throw new Error(`Failed to toggle checklist item: ${error.message}`);
  }

  return data;
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(itemId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting checklist item:", error);
    throw new Error(`Failed to delete checklist item: ${error.message}`);
  }
}

/**
 * Get checklist progress (completed vs total items)
 */
export async function getChecklistProgress(checklistId: string): Promise<{
  total: number;
  completed: number;
  percentage: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .select("done")
    .eq("checklist_id", checklistId);

  if (error) {
    console.error("Error fetching checklist progress:", error);
    return { total: 0, completed: 0, percentage: 0 };
  }

  const total = data?.length || 0;
  const completed = data?.filter((item) => item.done).length || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

/**
 * Get all checklists with items and progress for a task
 */
export async function getTaskChecklistsWithItems(taskId: string): Promise<
  Array<{
    checklist: DbChecklist;
    items: DbChecklistItem[];
    progress: { total: number; completed: number; percentage: number };
  }>
> {
  const checklists = await getTaskChecklists(taskId);

  const checklistsWithItems = await Promise.all(
    checklists.map(async (checklist) => {
      const items = await getChecklistItems(checklist.id);
      const progress = await getChecklistProgress(checklist.id);

      return {
        checklist,
        items,
        progress,
      };
    })
  );

  return checklistsWithItems;
}
