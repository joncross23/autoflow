/**
 * Windows 11 Theme - Fluent Design
 *
 * Microsoft's Fluent Design language with Mica and acrylic effects.
 * Uses Segoe UI Variable for native Windows feel.
 * Rounded corners (8px) and subtle material effects.
 * Microsoft-inspired accent colors.
 */

import type { ThemeDefinition } from "../index";

export const windowsTheme: ThemeDefinition = {
  id: "windows",
  name: "Windows 11",
  description: "Fluent Design with Mica materials and modern aesthetics",

  modes: {
    dark: {
      // Background layers - Mica-inspired
      bg: "#0D0D0D",
      bgSecondary: "#1F1F1F",
      bgTertiary: "#2D2D2D",
      bgElevated: "#3A3A3A",
      bgHover: "#3F3F3F",
      bgActive: "#4A4A4A",

      // Borders - subtle Fluent style
      border: "#5A5A5A",
      borderSubtle: "#353535",
      borderStrong: "#707070",

      // Text - Windows contrast
      text: "#FFFFFF",
      textSecondary: "#C5C5C5",
      textMuted: "#949494",
      textInverted: "#000000",

      // Shadows - Fluent elevation
      shadow: "rgba(0, 0, 0, 0.6)",
      shadowLight: "rgba(0, 0, 0, 0.3)",

      // Status colors - Windows style
      success: "#6CCB5F",
      successMuted: "#1A3D16",
      warning: "#FCE100",
      warningMuted: "#4D4400",
      error: "#FF99A4",
      errorMuted: "#4D1F24",
      info: "#60CDFF",
      infoMuted: "#0A3D4D",
    },
    light: {
      // Background layers - bright, clean
      bg: "#FFFFFF",
      bgSecondary: "#F3F3F3",
      bgTertiary: "#ECECEC",
      bgElevated: "#FFFFFF",
      bgHover: "#E8E8E8",
      bgActive: "#DCDCDC",

      // Borders - light Fluent
      border: "#C0C0C0",
      borderSubtle: "#E0E0E0",
      borderStrong: "#7A7A7A",

      // Text - Windows dark text
      text: "#000000",
      textSecondary: "#595959",
      textMuted: "#8A8A8A",
      textInverted: "#FFFFFF",

      // Shadows - subtle
      shadow: "rgba(0, 0, 0, 0.1)",
      shadowLight: "rgba(0, 0, 0, 0.05)",

      // Status colors - light adjusted
      success: "#0F7B0F",
      successMuted: "#DFF6DD",
      warning: "#9D5D00",
      warningMuted: "#FFF4CE",
      error: "#C42B1C",
      errorMuted: "#FDE7E9",
      info: "#0067C0",
      infoMuted: "#D0E8F7",
    },
  },

  accents: {
    cyan: {
      primary: "#00B7C3",
      primaryHover: "#009DA6",
      primaryMuted: "#0A3D4D",
      primaryGradient: "linear-gradient(135deg, #00B7C3 0%, #009DA6 100%)",
    },
    blue: {
      primary: "#0078D4",
      primaryHover: "#005A9E",
      primaryMuted: "#0A2D4D",
      primaryGradient: "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)",
    },
    emerald: {
      primary: "#107C10",
      primaryHover: "#0E6B0E",
      primaryMuted: "#0A3D0A",
      primaryGradient: "linear-gradient(135deg, #107C10 0%, #0E6B0E 100%)",
    },
    amber: {
      primary: "#FF8C00",
      primaryHover: "#E67E00",
      primaryMuted: "#4D2A00",
      primaryGradient: "linear-gradient(135deg, #FF8C00 0%, #E67E00 100%)",
    },
    violet: {
      primary: "#881798",
      primaryHover: "#6B126B",
      primaryMuted: "#3D0A3D",
      primaryGradient: "linear-gradient(135deg, #881798 0%, #6B126B 100%)",
    },
    rose: {
      primary: "#E3008C",
      primaryHover: "#C4007A",
      primaryMuted: "#4D002D",
      primaryGradient: "linear-gradient(135deg, #E3008C 0%, #C4007A 100%)",
    },
  },

  typography: {
    fontSans: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    fontMono: '"Cascadia Code", "Cascadia Mono", Consolas, monospace',
    fontHeading: '"Segoe UI Variable", "Segoe UI", sans-serif',
    headingWeight: 600,
    headingTracking: "0",
  },

  effects: {
    blur: "30px",
    vibrancy: true,
    borderRadius: "8px",
    borderRadiusLg: "12px",
    borderRadiusSm: "4px",
    transitionDuration: "167ms", // Fluent motion timing
    shadowSm: "0 2px 4px rgba(0, 0, 0, 0.14)",
    shadowMd: "0 4px 8px rgba(0, 0, 0, 0.20)",
    shadowLg: "0 8px 16px rgba(0, 0, 0, 0.26)",
    shadowXl: "0 16px 32px rgba(0, 0, 0, 0.32)",
  },
};
