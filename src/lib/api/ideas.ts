import { createClient } from "@/lib/supabase/client";
import type { DbIdea, DbIdeaInsert, DbIdeaUpdate, IdeaStatus } from "@/types/database";

/**
 * Fetch all ideas for the current user
 */
export async function getIdeas(status?: IdeaStatus): Promise<DbIdea[]> {
  const supabase = createClient();

  let query = supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
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
      return null; // Not found
    }
    throw new Error(error.message);
  }

  return data;
}

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
    .update(updates)
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

/**
 * Get idea counts by status
 */
export async function getIdeaCounts(): Promise<Record<IdeaStatus, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("status");

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
