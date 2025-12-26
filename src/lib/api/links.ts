/**
 * Links API
 * CRUD operations for external links on ideas and tasks
 * V1.3: Rich Cards feature
 */

import { createClient } from "@/lib/supabase/client";
import type { DbLink, DbLinkInsert, DbLinkUpdate } from "@/types/database";

// ============================================
// DEFAULT FAVICON OPTIONS
// ============================================

export const LINK_FAVICONS = [
  "🔗", // Default link
  "📘", // Documentation
  "📊", // Analytics/data
  "⚡", // Zapier/automation
  "📧", // Email
  "💡", // Ideas/notes
  "🎯", // Goals/targets
  "📁", // Files/folders
  "🌐", // Web/generic
  "💬", // Communication
  "📝", // Notes/docs
  "🔧", // Tools/settings
];

// ============================================
// IDEA LINKS
// ============================================

/**
 * Get links for an idea
 */
export async function getIdeaLinks(ideaId: string): Promise<DbLink[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching idea links:", error);
    throw new Error(`Failed to fetch links: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a link for an idea
 */
export async function createIdeaLink(
  ideaId: string,
  link: Omit<DbLinkInsert, "idea_id" | "task_id">
): Promise<DbLink> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("links")
    .insert({
      idea_id: ideaId,
      url: link.url,
      title: link.title || null,
      favicon: link.favicon || "🔗",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating idea link:", error);
    throw new Error(`Failed to create link: ${error.message}`);
  }

  return data;
}

// ============================================
// TASK LINKS
// ============================================

/**
 * Get links for a task
 */
export async function getTaskLinks(taskId: string): Promise<DbLink[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching task links:", error);
    throw new Error(`Failed to fetch links: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a link for a task
 */
export async function createTaskLink(
  taskId: string,
  link: Omit<DbLinkInsert, "idea_id" | "task_id">
): Promise<DbLink> {
  const supabase = createClient();

  const insertData: Record<string, unknown> = {
    task_id: taskId,
    url: link.url,
    title: link.title || null,
    favicon: link.favicon || "🔗",
  };

  // Only include relationship_type if it has a value (for task-to-task links)
  // This avoids errors if the column doesn't exist yet
  if (link.relationship_type) {
    insertData.relationship_type = link.relationship_type;
  }

  const { data, error } = await supabase
    .from("links")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating task link:", error);
    throw new Error(`Failed to create link: ${error.message}`);
  }

  return data;
}

// ============================================
// SHARED OPERATIONS
// ============================================

/**
 * Get a single link by ID
 */
export async function getLink(linkId: string): Promise<DbLink | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("id", linkId)
    .single();

  if (error) {
    console.error("Error fetching link:", error);
    return null;
  }

  return data;
}

/**
 * Update a link
 */
export async function updateLink(
  linkId: string,
  updates: DbLinkUpdate
): Promise<DbLink> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("links")
    .update(updates)
    .eq("id", linkId)
    .select()
    .single();

  if (error) {
    console.error("Error updating link:", error);
    throw new Error(`Failed to update link: ${error.message}`);
  }

  return data;
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId);

  if (error) {
    console.error("Error deleting link:", error);
    throw new Error(`Failed to delete link: ${error.message}`);
  }
}

// ============================================
// BACKLINKS (links pointing TO this entity)
// ============================================

/**
 * Backlink info with source entity details
 */
export interface BacklinkInfo {
  link: DbLink;
  sourceType: "idea" | "task";
  sourceId: string;
  sourceTitle: string;
}

/**
 * Get backlinks pointing TO this idea
 * These are links from other tasks/ideas that have url = `idea://{ideaId}`
 * OPTIMISED: Batched source entity lookups instead of N+1
 */
export async function getIdeaBacklinks(ideaId: string): Promise<BacklinkInfo[]> {
  const supabase = createClient();

  // Find all links where url matches idea://ideaId
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("url", `idea://${ideaId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching idea backlinks:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Collect unique IDs for batch fetching
  const taskIds = Array.from(new Set(data.filter(l => l.task_id).map(l => l.task_id!)));
  const ideaIds = Array.from(new Set(data.filter(l => l.idea_id).map(l => l.idea_id!)));

  // Batch fetch titles in parallel
  const [tasksResult, ideasResult] = await Promise.all([
    taskIds.length > 0
      ? supabase.from("tasks").select("id, title").in("id", taskIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ideaIds.length > 0
      ? supabase.from("ideas").select("id, title").in("id", ideaIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  // Build lookup maps
  const taskTitles = new Map<string, string>();
  (tasksResult.data || []).forEach(t => taskTitles.set(t.id, t.title));

  const ideaTitles = new Map<string, string>();
  (ideasResult.data || []).forEach(i => ideaTitles.set(i.id, i.title));

  // Build backlinks with cached titles
  return data.map(link => {
    if (link.task_id) {
      return {
        link,
        sourceType: "task" as const,
        sourceId: link.task_id,
        sourceTitle: taskTitles.get(link.task_id) || "Untitled task",
      };
    } else {
      return {
        link,
        sourceType: "idea" as const,
        sourceId: link.idea_id!,
        sourceTitle: ideaTitles.get(link.idea_id!) || "Untitled idea",
      };
    }
  });
}

/**
 * Get backlinks pointing TO this task
 * These are links from other ideas/tasks that have url = `task://{taskId}`
 * OPTIMISED: Batched source entity lookups instead of N+1
 */
export async function getTaskBacklinks(taskId: string): Promise<BacklinkInfo[]> {
  const supabase = createClient();

  // Find all links where url matches task://taskId
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("url", `task://${taskId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching task backlinks:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Collect unique IDs for batch fetching
  const ideaIds = Array.from(new Set(data.filter(l => l.idea_id).map(l => l.idea_id!)));
  const taskIds = Array.from(new Set(data.filter(l => l.task_id).map(l => l.task_id!)));

  // Batch fetch titles in parallel
  const [ideasResult, tasksResult] = await Promise.all([
    ideaIds.length > 0
      ? supabase.from("ideas").select("id, title").in("id", ideaIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    taskIds.length > 0
      ? supabase.from("tasks").select("id, title").in("id", taskIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  // Build lookup maps
  const ideaTitles = new Map<string, string>();
  (ideasResult.data || []).forEach(i => ideaTitles.set(i.id, i.title));

  const taskTitles = new Map<string, string>();
  (tasksResult.data || []).forEach(t => taskTitles.set(t.id, t.title));

  // Build backlinks with cached titles
  return data.map(link => {
    if (link.idea_id) {
      return {
        link,
        sourceType: "idea" as const,
        sourceId: link.idea_id,
        sourceTitle: ideaTitles.get(link.idea_id) || "Untitled idea",
      };
    } else {
      return {
        link,
        sourceType: "task" as const,
        sourceId: link.task_id!,
        sourceTitle: taskTitles.get(link.task_id!) || "Untitled task",
      };
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract domain from URL for display
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalise URL (add https:// if missing)
 */
export function normaliseUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}
