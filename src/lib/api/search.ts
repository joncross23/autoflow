/**
 * Search API
 * V1.0: Global search across ideas and tasks
 */

import { createClient } from "@/lib/supabase/client";
import { escapeIlikePattern } from "@/lib/security/sanitise";
import type { DbIdea, DbTask } from "@/types/database";

export interface SearchResult {
  type: "idea" | "task";
  id: string;
  title: string;
  description: string | null;
  status: string;
  ideaId?: string; // For tasks, the parent idea
  ideaTitle?: string;
  updatedAt: string;
}

export interface SearchResults {
  ideas: SearchResult[];
  tasks: SearchResult[];
  total: number;
}

/**
 * Search ideas and tasks by query
 */
export async function search(query: string, limit = 10): Promise<SearchResults> {
  if (!query.trim()) {
    return { ideas: [], tasks: [], total: 0 };
  }

  const supabase = createClient();
  // Escape special ILIKE characters to prevent SQL injection
  const escapedQuery = escapeIlikePattern(query.toLowerCase());
  const searchTerm = `%${escapedQuery}%`;

  // Search ideas
  const { data: ideas, error: ideasError } = await supabase
    .from("ideas")
    .select("id, title, description, status, updated_at")
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (ideasError) {
    console.error("Error searching ideas:", ideasError);
  }

  // Search tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, description, completed, updated_at, idea_id")
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (tasksError) {
    console.error("Error searching tasks:", tasksError);
  }

  // Get idea titles for tasks
  const ideaIds = tasks
    ?.filter((t) => t.idea_id)
    .map((t) => t.idea_id) || [];

  const ideaTitles: Record<string, string> = {};
  if (ideaIds.length > 0) {
    const { data: ideaTitlesData } = await supabase
      .from("ideas")
      .select("id, title")
      .in("id", ideaIds);

    ideaTitlesData?.forEach((i) => {
      ideaTitles[i.id] = i.title;
    });
  }

  // Transform results
  const ideaResults: SearchResult[] = (ideas || []).map((idea) => ({
    type: "idea" as const,
    id: idea.id,
    title: idea.title,
    description: idea.description,
    status: idea.status,
    updatedAt: idea.updated_at,
  }));

  const taskResults: SearchResult[] = (tasks || []).map((task) => ({
    type: "task" as const,
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.completed ? "completed" : "active",
    ideaId: task.idea_id || undefined,
    ideaTitle: task.idea_id ? ideaTitles[task.idea_id] : undefined,
    updatedAt: task.updated_at,
  }));

  return {
    ideas: ideaResults,
    tasks: taskResults,
    total: ideaResults.length + taskResults.length,
  };
}

/**
 * Get recent items (ideas and tasks) for display when search is empty
 */
export async function getRecentItems(limit = 5): Promise<SearchResults> {
  const supabase = createClient();

  // Get recent ideas
  const { data: ideas } = await supabase
    .from("ideas")
    .select("id, title, description, status, updated_at")
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .limit(limit);

  // Get recent tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, completed, updated_at, idea_id")
    .order("updated_at", { ascending: false })
    .limit(limit);

  // Get idea titles for tasks
  const ideaIds = tasks
    ?.filter((t) => t.idea_id)
    .map((t) => t.idea_id) || [];

  const ideaTitles: Record<string, string> = {};
  if (ideaIds.length > 0) {
    const { data: ideaTitlesData } = await supabase
      .from("ideas")
      .select("id, title")
      .in("id", ideaIds);

    ideaTitlesData?.forEach((i) => {
      ideaTitles[i.id] = i.title;
    });
  }

  const ideaResults: SearchResult[] = (ideas || []).map((idea) => ({
    type: "idea" as const,
    id: idea.id,
    title: idea.title,
    description: idea.description,
    status: idea.status,
    updatedAt: idea.updated_at,
  }));

  const taskResults: SearchResult[] = (tasks || []).map((task) => ({
    type: "task" as const,
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.completed ? "completed" : "active",
    ideaId: task.idea_id || undefined,
    ideaTitle: task.idea_id ? ideaTitles[task.idea_id] : undefined,
    updatedAt: task.updated_at,
  }));

  return {
    ideas: ideaResults,
    tasks: taskResults,
    total: ideaResults.length + taskResults.length,
  };
}
