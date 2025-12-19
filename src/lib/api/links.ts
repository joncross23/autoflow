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

  const { data, error } = await supabase
    .from("links")
    .insert({
      task_id: taskId,
      url: link.url,
      title: link.title || null,
      favicon: link.favicon || "🔗",
    })
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
