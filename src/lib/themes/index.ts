/**
 * AutoFlow Theme System
 *
 * Fully extracted theme definitions for easy iteration and extension.
 * Supports 3 system themes with dark/light modes and 6 accent colors each.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type SystemTheme = "autoflow" | "macos" | "windows";
export type Mode = "dark" | "light" | "system";
export type Accent = "blue" | "emerald" | "orange" | "purple" | "pink" | "slate";

export interface ThemeColors {
  // Background layers
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;

  // Borders
  border: string;
  borderSubtle: string;
  borderStrong: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;

  // Shadows
  shadow: string;
  shadowLight: string;

  // Status colors
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;
}

export interface AccentColors {
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  primaryGradient: string;
}

export interface ThemeTypography {
  fontSans: string;
  fontMono: string;
  fontHeading?: string;
  headingWeight: number;
  headingTracking: string;
}

export interface ThemeEffects {
  blur: string;
  vibrancy: boolean;
  borderRadius: string;
  borderRadiusLg: string;
  borderRadiusSm: string;
  transitionDuration: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

export interface ThemeDefinition {
  id: SystemTheme;
  name: string;
  description: string;
  modes: {
    dark: ThemeColors;
    light: ThemeColors;
  };
  accents: Record<Accent, AccentColors>;
  typography: ThemeTypography;
  effects: ThemeEffects;
}

// =============================================================================
// THEME IMPORTS
// =============================================================================

import { autoflowTheme } from "./definitions/autoflow";
import { macosTheme } from "./definitions/macos";
import { windowsTheme } from "./definitions/windows";

// =============================================================================
// THEME REGISTRY
// =============================================================================

export const themes: Record<SystemTheme, ThemeDefinition> = {
  autoflow: autoflowTheme,
  macos: macosTheme,
  windows: windowsTheme,
};

export const themeList: ThemeDefinition[] = Object.values(themes);

export function getTheme(id: SystemTheme): ThemeDefinition {
  return themes[id];
}

export function getThemeColors(
  id: SystemTheme,
  mode: "dark" | "light"
): ThemeColors {
  return themes[id].modes[mode];
}

export function getThemeAccent(
  id: SystemTheme,
  accent: Accent
): AccentColors {
  return themes[id].accents[accent];
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_THEME: SystemTheme = "autoflow";
export const DEFAULT_MODE: Mode = "dark";
export const DEFAULT_ACCENT: Accent = "blue";
