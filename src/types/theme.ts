/**
 * V1.6 Theme Types
 *
 * Type definitions for the theme system including:
 * - Background configuration (solid/gradient)
 * - Custom themes (user-created)
 * - Custom gradients (user-created)
 * - User theme preferences (stored in Supabase)
 */

import type { Accent } from "@/lib/themes";

// ============================================
// Background Configuration
// ============================================

export interface GradientConfig {
  from: string;
  to: string;
  angle: number;
}

export interface BackgroundConfig {
  type: "solid" | "gradient";
  solid: string;
  gradient: GradientConfig;
}

// ============================================
// Custom Theme (user-created)
// ============================================

export interface CustomTheme {
  id: string;
  name: string;
  accent: Accent;
  backgroundDark: BackgroundConfig;
  backgroundLight: BackgroundConfig;
}

// ============================================
// Custom Gradient (user-created)
// ============================================

export interface CustomGradient {
  id: string;
  name?: string;
  from: string;
  to: string;
  angle: number;
}

// ============================================
// User Theme Preferences (Supabase row)
// ============================================

export interface UserThemePreferences {
  id?: string;
  user_id?: string;
  active_theme_id: string;
  mode: "dark" | "light" | "system";
  accent: Accent;
  background_dark: BackgroundConfig;
  background_light: BackgroundConfig;
  custom_themes: CustomTheme[];
  custom_gradients: CustomGradient[];
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Constants
// ============================================

export const CUSTOM_LIMITS = {
  themes: 6,
  gradients: 6,
} as const;
