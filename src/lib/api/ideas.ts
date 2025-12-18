/**
 * Ideas API
 * V1.0: Unified model (Ideas + Projects merged)
 */

import { createClient } from "@/lib/supabase/client";
import type { DbIdea, DbIdeaInsert, DbIdeaUpdate, IdeaStatus } from "@/types/database";

// ============================================
// Filter Types
// ============================================

export interface IdeaFilters {
  status?: IdeaStatus | IdeaStatus[];
  archived?: boolean;
  search?: string;
  sortBy?: "created_at" | "updated_at" | "title" | "status" | "priority";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// ============================================
// Read Operations
// ============================================

/**
 * Fetch all ideas for the current user with optional filters
 */
export async function getIdeas(filters?: IdeaFilters): Promise<DbIdea[]> {
  const supabase = createClient();

  let query = supabase.from("ideas").select("*");

  // Status filter
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in("status", filters.status);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  // Archived filter (default: hide archived)
  if (filters?.archived !== undefined) {
    query = query.eq("archived", filters.archived);
  } else {
    query = query.eq("archived", false);
  }

  // Search filter (title and description)
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch a single idea by ID
 */
export async function getIdea(id: string): Promise<DbIdea | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get idea counts by status
 */
export async function getIdeaCounts(): Promise<Record<IdeaStatus, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("status")
    .eq("archived", false);

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<IdeaStatus, number> = {
    new: 0,
    evaluating: 0,
    accepted: 0,
    doing: 0,
    complete: 0,
    parked: 0,
    dropped: 0,
  };

  data?.forEach((idea) => {
    counts[idea.status as IdeaStatus]++;
  });

  return counts;
}

/**
 * Get ideas for delivery board (accepted or doing status)
 */
export async function getDeliveryIdeas(): Promise<DbIdea[]> {
  return getIdeas({
    status: ["accepted", "doing"],
    archived: false,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
}

// ============================================
// Write Operations
// ============================================

/**
 * Create a new idea
 */
export async function createIdea(idea: DbIdeaInsert): Promise<DbIdea> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      ...idea,
      user_id: user.id,
      status: idea.status || "new",
      priority: idea.priority || "medium",
      archived: idea.archived || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing idea
 */
export async function updateIdea(id: string, updates: DbIdeaUpdate): Promise<DbIdea> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete an idea
 */
export async function deleteIdea(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================
// Status Transitions
// ============================================

/**
 * Update idea status with automatic timestamp handling
 */
export async function updateIdeaStatus(id: string, status: IdeaStatus): Promise<DbIdea> {
  const updates: DbIdeaUpdate = { status };

  // Set started_at when moving to doing
  if (status === "doing") {
    const idea = await getIdea(id);
    if (idea && !idea.started_at) {
      updates.started_at = new Date().toISOString();
    }
  }

  // Set completed_at when completing
  if (status === "complete") {
    updates.completed_at = new Date().toISOString();
  }

  return updateIdea(id, updates);
}

/**
 * Accept an idea (move to accepted status)
 */
export async function acceptIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "accepted");
}

/**
 * Start working on an idea (move to doing status)
 */
export async function startIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "doing");
}

/**
 * Complete an idea
 */
export async function completeIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "complete");
}

/**
 * Park an idea (put on hold)
 */
export async function parkIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "parked");
}

/**
 * Drop an idea (won't do)
 */
export async function dropIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "dropped");
}

// ============================================
// Archive Operations
// ============================================

/**
 * Archive an idea
 */
export async function archiveIdea(id: string): Promise<DbIdea> {
  return updateIdea(id, { archived: true });
}

/**
 * Unarchive an idea
 */
export async function unarchiveIdea(id: string): Promise<DbIdea> {
  return updateIdea(id, { archived: false });
}

/**
 * Get archived ideas
 */
export async function getArchivedIdeas(): Promise<DbIdea[]> {
  return getIdeas({ archived: true });
}

// ============================================
// Bulk Operations
// ============================================

/**
 * Archive multiple ideas
 */
export async function bulkArchiveIdeas(ids: string[]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update status for multiple ideas
 */
export async function bulkUpdateStatus(ids: string[], status: IdeaStatus): Promise<void> {
  const supabase = createClient();

  const updates: DbIdeaUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "complete") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("ideas")
    .update(updates)
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Delete multiple ideas
 */
export async function bulkDeleteIdeas(ids: string[]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}
