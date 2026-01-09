/**
 * V1.6 Theme Presets
 *
 * 6 default themes that bundle accent colour + background
 * Each theme has dark and light mode backgrounds
 */

import type { Accent } from "./index";
import type { BackgroundConfig } from "@/types/theme";

export interface ThemePreset {
  id: string;
  name: string;
  accent: Accent;
  backgroundDark: BackgroundConfig;
  backgroundLight: BackgroundConfig;
}

/**
 * Default Theme Presets
 *
 * Each preset combines:
 * - An accent colour
 * - A dark mode background (gradient or solid)
 * - A light mode background (usually solid)
 */
export const DEFAULT_THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean",
    name: "Ocean",
    accent: "cyan",
    backgroundDark: {
      type: "gradient",
      solid: "#0f2538",
      gradient: {
        from: "#264b73",
        to: "#0f2538",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#f0f9ff",
      gradient: {
        from: "#e0f2fe",
        to: "#f0f9ff",
        angle: 135,
      },
    },
  },
  {
    id: "forest",
    name: "Forest",
    accent: "emerald",
    backgroundDark: {
      type: "gradient",
      solid: "#0c1f16",
      gradient: {
        from: "#1a4535",
        to: "#0c1f16",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#ecfdf5",
      gradient: {
        from: "#d1fae5",
        to: "#ecfdf5",
        angle: 135,
      },
    },
  },
  {
    id: "ember",
    name: "Ember",
    accent: "coral",
    backgroundDark: {
      type: "gradient",
      solid: "#1f0f0f",
      gradient: {
        from: "#4a2424",
        to: "#1f0f0f",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#fffbeb",
      gradient: {
        from: "#fef3c7",
        to: "#fffbeb",
        angle: 135,
      },
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    accent: "blue",
    backgroundDark: {
      type: "gradient",
      solid: "#111827",
      gradient: {
        from: "#263348",
        to: "#111827",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#f8fafc",
      gradient: {
        from: "#e2e8f0",
        to: "#f8fafc",
        angle: 135,
      },
    },
  },
  {
    id: "rose",
    name: "Rose",
    accent: "rose",
    backgroundDark: {
      type: "gradient",
      solid: "#1f0c14",
      gradient: {
        from: "#4a2233",
        to: "#1f0c14",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#fff1f2",
      gradient: {
        from: "#ffe4e6",
        to: "#fff1f2",
        angle: 135,
      },
    },
  },
  {
    id: "carbon",
    name: "Carbon",
    accent: "teal",
    backgroundDark: {
      type: "solid",
      solid: "#1a1a1a",
      gradient: {
        from: "#2d2d2d",
        to: "#1a1a1a",
        angle: 135,
      },
    },
    backgroundLight: {
      type: "solid",
      solid: "#ffffff",
      gradient: {
        from: "#f5f5f5",
        to: "#ffffff",
        angle: 135,
      },
    },
  },
];

/**
 * Get a theme preset by ID
 */
export function getThemePreset(id: string): ThemePreset | undefined {
  return DEFAULT_THEME_PRESETS.find((p) => p.id === id);
}

/**
 * Get the default theme preset
 */
export function getDefaultThemePreset(): ThemePreset {
  return DEFAULT_THEME_PRESETS[0]; // Ocean
}
