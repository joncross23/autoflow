/**
 * Theme Preferences API
 * V1.6: User theme customisation stored in Supabase
 */

import { createClient } from "@/lib/supabase/client";
import type { UserThemePreferences, CustomTheme, CustomGradient, BackgroundConfig, CUSTOM_LIMITS } from "@/types/theme";
import type { Accent } from "@/lib/themes";
import { getDefaultThemePreset } from "@/lib/themes/presets";

/**
 * Default preferences for new users
 */
function getDefaultPreferences(): Omit<UserThemePreferences, "id" | "user_id" | "created_at" | "updated_at"> {
  const defaultTheme = getDefaultThemePreset();
  return {
    active_theme_id: defaultTheme.id,
    mode: "dark",
    accent: defaultTheme.accent,
    background_dark: defaultTheme.backgroundDark,
    background_light: defaultTheme.backgroundLight,
    custom_themes: [],
    custom_gradients: [],
  };
}

/**
 * Get user theme preferences
 * Returns null if user is not authenticated or has no preferences
 */
export async function getUserThemePreferences(): Promise<UserThemePreferences | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_theme_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching theme preferences:", error);
    throw new Error(`Failed to fetch theme preferences: ${error.message}`);
  }

  return data;
}

/**
 * Get or create user theme preferences
 * Creates default preferences if none exist
 */
export async function getOrCreateThemePreferences(): Promise<UserThemePreferences> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Try to get existing preferences
  const existing = await getUserThemePreferences();
  if (existing) return existing;

  // Create default preferences
  const defaults = getDefaultPreferences();
  const { data, error } = await supabase
    .from("user_theme_preferences")
    .insert({
      user_id: user.id,
      ...defaults,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating theme preferences:", error);
    throw new Error(`Failed to create theme preferences: ${error.message}`);
  }

  return data;
}

/**
 * Update theme preferences (partial update)
 */
export async function updateThemePreferences(
  updates: Partial<Pick<UserThemePreferences, "active_theme_id" | "mode" | "accent" | "background_dark" | "background_light">>
): Promise<UserThemePreferences> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure preferences exist first
  await getOrCreateThemePreferences();

  const { data, error } = await supabase
    .from("user_theme_preferences")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating theme preferences:", error);
    throw new Error(`Failed to update theme preferences: ${error.message}`);
  }

  return data;
}

/**
 * Save a custom theme (max 6)
 * Returns the saved theme, or null if limit reached
 */
export async function saveCustomTheme(theme: Omit<CustomTheme, "id">): Promise<CustomTheme | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = await getOrCreateThemePreferences();

  if (prefs.custom_themes.length >= 6) {
    return null; // Limit reached
  }

  const newTheme: CustomTheme = {
    ...theme,
    id: crypto.randomUUID(),
  };

  const updatedThemes = [...prefs.custom_themes, newTheme];

  const { error } = await supabase
    .from("user_theme_preferences")
    .update({
      custom_themes: updatedThemes,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error saving custom theme:", error);
    throw new Error(`Failed to save custom theme: ${error.message}`);
  }

  return newTheme;
}

/**
 * Update an existing custom theme
 */
export async function updateCustomTheme(
  themeId: string,
  updates: Partial<Omit<CustomTheme, "id">>
): Promise<CustomTheme | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = await getOrCreateThemePreferences();

  const themeIndex = prefs.custom_themes.findIndex(t => t.id === themeId);
  if (themeIndex === -1) return null;

  const updatedTheme = {
    ...prefs.custom_themes[themeIndex],
    ...updates,
  };

  const updatedThemes = [...prefs.custom_themes];
  updatedThemes[themeIndex] = updatedTheme;

  const { error } = await supabase
    .from("user_theme_preferences")
    .update({
      custom_themes: updatedThemes,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating custom theme:", error);
    throw new Error(`Failed to update custom theme: ${error.message}`);
  }

  return updatedTheme;
}

/**
 * Delete a custom theme
 */
export async function deleteCustomTheme(themeId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = await getOrCreateThemePreferences();

  const updatedThemes = prefs.custom_themes.filter(t => t.id !== themeId);

  // If the deleted theme was active, fall back to ocean
  let activeThemeId = prefs.active_theme_id;
  if (activeThemeId === themeId) {
    activeThemeId = "ocean";
  }

  const { error } = await supabase
    .from("user_theme_preferences")
    .update({
      custom_themes: updatedThemes,
      active_theme_id: activeThemeId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting custom theme:", error);
    throw new Error(`Failed to delete custom theme: ${error.message}`);
  }
}

/**
 * Save a custom gradient (max 6)
 * Returns the saved gradient, or null if limit reached
 */
export async function saveCustomGradient(gradient: Omit<CustomGradient, "id">): Promise<CustomGradient | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = await getOrCreateThemePreferences();

  if (prefs.custom_gradients.length >= 6) {
    return null; // Limit reached
  }

  const newGradient: CustomGradient = {
    ...gradient,
    id: crypto.randomUUID(),
  };

  const updatedGradients = [...prefs.custom_gradients, newGradient];

  const { error } = await supabase
    .from("user_theme_preferences")
    .update({
      custom_gradients: updatedGradients,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error saving custom gradient:", error);
    throw new Error(`Failed to save custom gradient: ${error.message}`);
  }

  return newGradient;
}

/**
 * Delete a custom gradient
 */
export async function deleteCustomGradient(gradientId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = await getOrCreateThemePreferences();

  const updatedGradients = prefs.custom_gradients.filter(g => g.id !== gradientId);

  const { error } = await supabase
    .from("user_theme_preferences")
    .update({
      custom_gradients: updatedGradients,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting custom gradient:", error);
    throw new Error(`Failed to delete custom gradient: ${error.message}`);
  }
}

/**
 * Apply a theme preset (updates accent and background)
 */
export async function applyThemePreset(presetId: string): Promise<UserThemePreferences> {
  // Import here to avoid circular dependency
  const { getThemePreset, getDefaultThemePreset } = await import("@/lib/themes/presets");

  const preset = getThemePreset(presetId) || getDefaultThemePreset();

  return updateThemePreferences({
    active_theme_id: preset.id,
    accent: preset.accent,
    background_dark: preset.backgroundDark,
    background_light: preset.backgroundLight,
  });
}

/**
 * Apply a custom theme (updates accent and background)
 */
export async function applyCustomTheme(customTheme: CustomTheme): Promise<UserThemePreferences> {
  return updateThemePreferences({
    active_theme_id: customTheme.id,
    accent: customTheme.accent,
    background_dark: customTheme.backgroundDark,
    background_light: customTheme.backgroundLight,
  });
}
