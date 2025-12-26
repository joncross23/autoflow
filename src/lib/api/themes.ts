/**
 * Theme (Category) API
 *
 * NOTE: These functions are currently NOT USED in the application.
 * The "themes" here refer to idea categories/tags, NOT visual appearance themes.
 * Visual theming uses localStorage via ThemeProvider.
 *
 * These functions are retained for potential future use when implementing
 * a category/tagging system for ideas.
 *
 * V1.0: Multi-select categories for ideas
 */

import { createClient } from "@/lib/supabase/client";
import type { DbTheme, DbThemeInsert, DbThemeUpdate, DbIdeaTheme } from "@/types/database";

// Type for Supabase join results when selecting themes through junction tables
type SupabaseThemeJoinResult = Array<{
  idea_id?: string;
  theme_id?: string;
  themes: DbTheme | DbTheme[] | null;
}>;

// Helper to extract theme from join result (handles both single object and array)
function extractTheme(themes: DbTheme | DbTheme[] | null): DbTheme | null {
  if (!themes) return null;
  return Array.isArray(themes) ? themes[0] ?? null : themes;
}

/**
 * Get all themes for the current user
 */
export async function getThemes(): Promise<DbTheme[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching themes:", error);
    throw new Error(`Failed to fetch themes: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single theme by ID
 */
export async function getTheme(id: string): Promise<DbTheme | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new theme
 */
export async function createTheme(theme: DbThemeInsert): Promise<DbTheme> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("themes")
    .insert({
      user_id: user.id,
      name: theme.name,
      color: theme.color || "blue",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating theme:", error);
    throw new Error(`Failed to create theme: ${error.message}`);
  }

  return data;
}

/**
 * Update a theme
 */
export async function updateTheme(id: string, updates: DbThemeUpdate): Promise<DbTheme> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("themes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating theme:", error);
    throw new Error(`Failed to update theme: ${error.message}`);
  }

  return data;
}

/**
 * Delete a theme
 */
export async function deleteTheme(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("themes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting theme:", error);
    throw new Error(`Failed to delete theme: ${error.message}`);
  }
}

/**
 * Get themes for an idea
 */
export async function getIdeaThemes(ideaId: string): Promise<DbTheme[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_themes")
    .select("theme_id, themes(*)")
    .eq("idea_id", ideaId);

  if (error) {
    console.error("Error fetching idea themes:", error);
    throw new Error(`Failed to fetch idea themes: ${error.message}`);
  }

  // Extract the theme objects from the join
  return (data as unknown as SupabaseThemeJoinResult | null)
    ?.map((item) => extractTheme(item.themes))
    .filter((theme): theme is DbTheme => theme !== null) || [];
}

/**
 * Add a theme to an idea
 */
export async function addThemeToIdea(ideaId: string, themeId: string): Promise<DbIdeaTheme> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_themes")
    .insert({
      idea_id: ideaId,
      theme_id: themeId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding theme to idea:", error);
    throw new Error(`Failed to add theme: ${error.message}`);
  }

  return data;
}

/**
 * Remove a theme from an idea
 */
export async function removeThemeFromIdea(ideaId: string, themeId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("idea_themes")
    .delete()
    .eq("idea_id", ideaId)
    .eq("theme_id", themeId);

  if (error) {
    console.error("Error removing theme from idea:", error);
    throw new Error(`Failed to remove theme: ${error.message}`);
  }
}

/**
 * Set themes for an idea (replaces all existing)
 */
export async function setIdeaThemes(ideaId: string, themeIds: string[]): Promise<void> {
  const supabase = createClient();

  // Delete existing theme associations
  const { error: deleteError } = await supabase
    .from("idea_themes")
    .delete()
    .eq("idea_id", ideaId);

  if (deleteError) {
    console.error("Error clearing idea themes:", deleteError);
    throw new Error(`Failed to update themes: ${deleteError.message}`);
  }

  // Add new theme associations
  if (themeIds.length > 0) {
    const { error: insertError } = await supabase
      .from("idea_themes")
      .insert(themeIds.map(themeId => ({
        idea_id: ideaId,
        theme_id: themeId,
      })));

    if (insertError) {
      console.error("Error setting idea themes:", insertError);
      throw new Error(`Failed to update themes: ${insertError.message}`);
    }
  }
}
