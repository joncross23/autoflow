/**
 * macOS Tahoe Theme - Stylized
 *
 * Inspired by macOS with AutoFlow's interpretation.
 * Uses system fonts (-apple-system) for native feel.
 * Vibrancy-inspired blur effects on elevated surfaces.
 * Apple-inspired accent colors.
 */

import type { ThemeDefinition } from "../index";

export const macosTheme: ThemeDefinition = {
  id: "macos",
  name: "macOS Tahoe",
  description: "Refined design inspired by macOS with vibrancy effects",

  modes: {
    dark: {
      // Background layers - warm greys
      bg: "#1A1A1A",
      bgSecondary: "#252525",
      bgTertiary: "#303030",
      bgElevated: "#3C3C3C",
      bgHover: "#414141",
      bgActive: "#4A4A4A",

      // Borders - subtle separation
      border: "#424242",
      borderSubtle: "#2E2E2E",
      borderStrong: "#5A5A5A",

      // Text - Apple-style whites
      text: "#F5F5F7",
      textSecondary: "#A1A1A6",
      textMuted: "#86868B",
      textInverted: "#000000",

      // Shadows - soft, layered
      shadow: "rgba(0, 0, 0, 0.4)",
      shadowLight: "rgba(0, 0, 0, 0.15)",

      // Status colors - macOS style
      success: "#32D74B",
      successMuted: "#0A3D1C",
      warning: "#FF9F0A",
      warningMuted: "#4D3000",
      error: "#FF453A",
      errorMuted: "#4D1512",
      info: "#0A84FF",
      infoMuted: "#0A2D4D",
    },
    light: {
      // Background layers - clean, airy
      bg: "#FFFFFF",
      bgSecondary: "#F6F6F6",
      bgTertiary: "#EFEFEF",
      bgElevated: "#FFFFFF",
      bgHover: "#E8E8E8",
      bgActive: "#DCDCDC",

      // Borders - subtle
      border: "#D8D8D8",
      borderSubtle: "#E8E8E8",
      borderStrong: "#888888",

      // Text - comfortable reading
      text: "#1D1D1F",
      textSecondary: "#666666",
      textMuted: "#8E8E93",
      textInverted: "#FFFFFF",

      // Shadows - minimal
      shadow: "rgba(0, 0, 0, 0.08)",
      shadowLight: "rgba(0, 0, 0, 0.03)",

      // Status colors - light mode adjusted
      success: "#28CD41",
      successMuted: "#D4F5DB",
      warning: "#FF9500",
      warningMuted: "#FFF4E0",
      error: "#FF3B30",
      errorMuted: "#FFE5E3",
      info: "#007AFF",
      infoMuted: "#E0F0FF",
    },
  },

  accents: {
    cyan: {
      primary: "#5AC8FA",
      primaryHover: "#4AB8EA",
      primaryMuted: "#0A3D4D",
      primaryGradient: "linear-gradient(135deg, #5AC8FA 0%, #32ADE6 100%)",
    },
    sky: {
      primary: "#52C0F5",
      primaryHover: "#3EAEE3",
      primaryMuted: "#0A3A4D",
      primaryGradient: "linear-gradient(135deg, #52C0F5 0%, #3EAEE3 100%)",
    },
    teal: {
      primary: "#64D2C0",
      primaryHover: "#52BFB0",
      primaryMuted: "#0A3D35",
      primaryGradient: "linear-gradient(135deg, #64D2C0 0%, #52BFB0 100%)",
    },
    blue: {
      primary: "#007AFF",
      primaryHover: "#0056CC",
      primaryMuted: "#0A2D4D",
      primaryGradient: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    },
    emerald: {
      primary: "#30D158",
      primaryHover: "#28B84C",
      primaryMuted: "#0A3D1C",
      primaryGradient: "linear-gradient(135deg, #30D158 0%, #28CD41 100%)",
    },
    coral: {
      primary: "#FF9F5A",
      primaryHover: "#FF8C3D",
      primaryMuted: "#4D2D0F",
      primaryGradient: "linear-gradient(135deg, #FF9F5A 0%, #FF8C3D 100%)",
    },
    rose: {
      primary: "#FF2D55",
      primaryHover: "#E6294D",
      primaryMuted: "#4D0F1A",
      primaryGradient: "linear-gradient(135deg, #FF2D55 0%, #FF375F 100%)",
    },
  },

  typography: {
    fontSans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    fontMono: '"SF Mono", Menlo, Monaco, Consolas, monospace',
    fontHeading: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    headingWeight: 600,
    headingTracking: "-0.01em",
  },

  effects: {
    blur: "24px",
    vibrancy: true,
    borderRadius: "0.75rem",
    borderRadiusLg: "1rem",
    borderRadiusSm: "0.375rem",
    transitionDuration: "200ms",
    shadowSm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
    shadowMd: "0 4px 12px rgba(0, 0, 0, 0.15)",
    shadowLg: "0 12px 36px rgba(0, 0, 0, 0.2)",
    shadowXl: "0 24px 60px rgba(0, 0, 0, 0.25)",
  },
};
