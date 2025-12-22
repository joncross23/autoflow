/**
 * AutoFlow Theme - Luxury/Refined
 *
 * Elegant, premium feel with sophisticated typography.
 * Uses Plus Jakarta Sans for a distinctive, modern look.
 * Deep shadows, no blur effects, refined color palette.
 */

import type { ThemeDefinition } from "../index";

export const autoflowTheme: ThemeDefinition = {
  id: "autoflow",
  name: "AutoFlow",
  description: "Elegant, premium design with sophisticated typography",

  modes: {
    dark: {
      // Background layers - deep, rich blacks
      bg: "#0A0A0B",
      bgSecondary: "#131316",
      bgTertiary: "#1A1A1F",
      bgElevated: "#1F1F26",
      bgHover: "#252530",
      bgActive: "#2D2D35",

      // Borders - subtle definition
      border: "#27272A",
      borderSubtle: "#1F1F23",
      borderStrong: "#3F3F46",

      // Text - high contrast
      text: "#FAFAFA",
      textSecondary: "#A1A1AA",
      textMuted: "#71717A",
      textInverted: "#000000",

      // Shadows - dramatic depth
      shadow: "rgba(0, 0, 0, 0.5)",
      shadowLight: "rgba(0, 0, 0, 0.25)",

      // Status colors - vibrant on dark
      success: "#22C55E",
      successMuted: "#064E3B",
      warning: "#F59E0B",
      warningMuted: "#78350F",
      error: "#EF4444",
      errorMuted: "#7F1D1D",
      info: "#3B82F6",
      infoMuted: "#1E3A5F",
    },
    light: {
      // Background layers - clean whites
      bg: "#FAFAFA",
      bgSecondary: "#F4F4F5",
      bgTertiary: "#E4E4E7",
      bgElevated: "#FFFFFF",
      bgHover: "#E4E4E7",
      bgActive: "#D4D4D8",

      // Borders - soft definition
      border: "#D4D4D8",
      borderSubtle: "#E4E4E7",
      borderStrong: "#A1A1AA",

      // Text - comfortable contrast
      text: "#09090B",
      textSecondary: "#52525B",
      textMuted: "#A1A1AA",
      textInverted: "#FFFFFF",

      // Shadows - subtle elevation
      shadow: "rgba(0, 0, 0, 0.08)",
      shadowLight: "rgba(0, 0, 0, 0.04)",

      // Status colors - adjusted for light bg
      success: "#16A34A",
      successMuted: "#DCFCE7",
      warning: "#D97706",
      warningMuted: "#FEF3C7",
      error: "#DC2626",
      errorMuted: "#FEE2E2",
      info: "#2563EB",
      infoMuted: "#DBEAFE",
    },
  },

  accents: {
    cyan: {
      primary: "#06B6D4",
      primaryHover: "#0891B2",
      primaryMuted: "#164E63",
      primaryGradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
    },
    blue: {
      primary: "#3B82F6",
      primaryHover: "#2563EB",
      primaryMuted: "#1E3A5F",
      primaryGradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    },
    emerald: {
      primary: "#10B981",
      primaryHover: "#059669",
      primaryMuted: "#064E3B",
      primaryGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
    amber: {
      primary: "#F59E0B",
      primaryHover: "#D97706",
      primaryMuted: "#78350F",
      primaryGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    },
    indigo: {
      primary: "#6366F1",
      primaryHover: "#4F46E5",
      primaryMuted: "#312E81",
      primaryGradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    },
    rose: {
      primary: "#F43F5E",
      primaryHover: "#E11D48",
      primaryMuted: "#881337",
      primaryGradient: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
    },
  },

  typography: {
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontMono: '"SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
    headingWeight: 700,
    headingTracking: "-0.025em",
  },

  effects: {
    blur: "0",
    vibrancy: false,
    borderRadius: "0.5rem",
    borderRadiusLg: "0.75rem",
    borderRadiusSm: "0.25rem",
    transitionDuration: "150ms",
    shadowSm: "0 1px 2px rgba(0, 0, 0, 0.4)",
    shadowMd: "0 4px 8px rgba(0, 0, 0, 0.4)",
    shadowLg: "0 8px 24px rgba(0, 0, 0, 0.5)",
    shadowXl: "0 20px 40px rgba(0, 0, 0, 0.6)",
  },
};
