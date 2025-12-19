/**
 * Saved Views API
 * V1.1: User-defined filter presets and published views
 */

import { createClient } from "@/lib/supabase/client";
import type {
  DbSavedView,
  DbSavedViewInsert,
  DbSavedViewUpdate,
  DbPublishedView,
  DbPublishedViewInsert,
  DbPublishedViewUpdate,
  IdeaFilters,
} from "@/types/database";

// ============================================
// Saved Views (User Filter Presets)
// ============================================

/**
 * Get all saved views for the current user
 */
export async function getSavedViews(): Promise<DbSavedView[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("saved_views")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching saved views:", error);
    throw new Error(`Failed to fetch saved views: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single saved view by ID
 */
export async function getSavedView(id: string): Promise<DbSavedView | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_views")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch saved view: ${error.message}`);
  }

  return data;
}

/**
 * Get the default saved view for the current user
 */
export async function getDefaultSavedView(): Promise<DbSavedView | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("saved_views")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch default view: ${error.message}`);
  }

  return data;
}

/**
 * Create a new saved view
 */
export async function createSavedView(view: DbSavedViewInsert): Promise<DbSavedView> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // If setting as default, clear other defaults first
  if (view.is_default) {
    await supabase
      .from("saved_views")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("saved_views")
    .insert({
      ...view,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating saved view:", error);
    throw new Error(`Failed to create saved view: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing saved view
 */
export async function updateSavedView(
  id: string,
  updates: DbSavedViewUpdate
): Promise<DbSavedView> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // If setting as default, clear other defaults first
  if (updates.is_default) {
    await supabase
      .from("saved_views")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", id);
  }

  const { data, error } = await supabase
    .from("saved_views")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating saved view:", error);
    throw new Error(`Failed to update saved view: ${error.message}`);
  }

  return data;
}

/**
 * Delete a saved view
 */
export async function deleteSavedView(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("saved_views")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting saved view:", error);
    throw new Error(`Failed to delete saved view: ${error.message}`);
  }
}

/**
 * Set a view as the default
 */
export async function setDefaultView(id: string): Promise<DbSavedView> {
  return updateSavedView(id, { is_default: true });
}

// ============================================
// Published Views (Shareable Read-Only)
// ============================================

/**
 * Get all published views for the current user
 */
export async function getPublishedViews(): Promise<DbPublishedView[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("published_views")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching published views:", error);
    throw new Error(`Failed to fetch published views: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a published view by slug (for public access)
 */
export async function getPublishedViewBySlug(slug: string): Promise<DbPublishedView | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("published_views")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch published view: ${error.message}`);
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
}

/**
 * Create a published view from a saved view
 */
export async function publishView(
  savedViewId: string,
  options: {
    slug: string;
    name?: string;
    description?: string;
    expiresAt?: string;
    password?: string;
  }
): Promise<DbPublishedView> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the saved view
  const savedView = await getSavedView(savedViewId);
  if (!savedView) throw new Error("Saved view not found");

  const insert: DbPublishedViewInsert = {
    saved_view_id: savedViewId,
    name: options.name || savedView.name,
    slug: options.slug,
    description: options.description || savedView.description,
    filters: savedView.filters,
    column_config: savedView.column_config,
    is_active: true,
    expires_at: options.expiresAt || null,
    // Note: Password hashing should be done server-side in production
    password_hash: options.password ? await hashPassword(options.password) : null,
  };

  const { data, error } = await supabase
    .from("published_views")
    .insert({
      ...insert,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error publishing view:", error);
    throw new Error(`Failed to publish view: ${error.message}`);
  }

  return data;
}

/**
 * Create a quick published view without a saved view
 */
export async function quickPublishView(
  view: DbPublishedViewInsert
): Promise<DbPublishedView> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("published_views")
    .insert({
      ...view,
      user_id: user.id,
      is_active: view.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error publishing view:", error);
    throw new Error(`Failed to publish view: ${error.message}`);
  }

  return data;
}

/**
 * Update a published view
 */
export async function updatePublishedView(
  id: string,
  updates: DbPublishedViewUpdate
): Promise<DbPublishedView> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("published_views")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating published view:", error);
    throw new Error(`Failed to update published view: ${error.message}`);
  }

  return data;
}

/**
 * Deactivate a published view
 */
export async function unpublishView(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("published_views")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error unpublishing view:", error);
    throw new Error(`Failed to unpublish view: ${error.message}`);
  }
}

/**
 * Delete a published view
 */
export async function deletePublishedView(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("published_views")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting published view:", error);
    throw new Error(`Failed to delete published view: ${error.message}`);
  }
}

/**
 * Increment view count for a published view
 */
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.rpc("increment_view_count", { view_id: id });

  if (error) {
    // Non-critical error, just log it
    console.error("Error incrementing view count:", error);
  }
}

/**
 * Generate a unique slug for a published view
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("published_views")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error && error.code === "PGRST116") {
    return true; // No matching row found
  }

  return !data;
}

// ============================================
// Helpers
// ============================================

/**
 * Simple password hashing (use bcrypt in production)
 * This is a placeholder - in production, use server-side hashing
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
