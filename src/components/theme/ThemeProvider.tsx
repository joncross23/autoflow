"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  SystemTheme,
  Mode,
  Accent,
  ThemeDefinition,
} from "@/lib/themes";

export type BackgroundType = "solid" | "gradient";

export interface GradientConfig {
  from: string;
  to: string;
  angle: number;
}

export interface BackgroundConfig {
  type: BackgroundType;
  solid: string;
  gradient: GradientConfig;
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: "gradient",
  solid: "#0a1418",
  gradient: {
    from: "#1a3a4a",
    to: "#0a1418",
    angle: 135,
  },
};

export const PRESET_GRADIENTS: { name: string; config: GradientConfig }[] = [
  { name: "Ocean", config: { from: "#1a3a4a", to: "#0a1418", angle: 135 } },
  { name: "Midnight", config: { from: "#1e1b4b", to: "#0f0f23", angle: 135 } },
  { name: "Forest", config: { from: "#14352a", to: "#0a1810", angle: 135 } },
  { name: "Ember", config: { from: "#3d1c1c", to: "#1a0a0a", angle: 135 } },
  { name: "Slate", config: { from: "#1e293b", to: "#0f172a", angle: 135 } },
  { name: "Aurora", config: { from: "#1e3a5f", to: "#0d1f2d", angle: 160 } },
];

export const PRESET_SOLIDS: { name: string; color: string }[] = [
  { name: "Charcoal", color: "#0a1418" },
  { name: "Midnight", color: "#0f0f23" },
  { name: "Forest", color: "#0a1810" },
  { name: "Slate", color: "#0f172a" },
  { name: "Obsidian", color: "#09090b" },
  { name: "Navy", color: "#0c1929" },
];
import {
  themes,
  DEFAULT_THEME,
  DEFAULT_MODE,
  DEFAULT_ACCENT,
  migrateAccent,
} from "@/lib/themes";

interface ThemeContextType {
  // System theme (autoflow, macos, windows)
  systemTheme: SystemTheme;
  setSystemTheme: (theme: SystemTheme) => void;

  // Mode (dark, light, system)
  mode: Mode;
  setMode: (mode: Mode) => void;
  resolvedMode: "dark" | "light";

  // Accent color
  accent: Accent;
  setAccent: (accent: Accent) => void;

  // Background
  background: BackgroundConfig;
  setBackground: (config: BackgroundConfig) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setSolidColor: (color: string) => void;
  setGradient: (gradient: GradientConfig) => void;

  // Current theme definition for reference
  themeDefinition: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultSystemTheme?: SystemTheme;
  defaultMode?: Mode;
  defaultAccent?: Accent;
  storageKey?: string;
}

interface PersistedTheme {
  mode?: Mode;
  accent?: Accent;
  systemTheme?: SystemTheme;
  background?: BackgroundConfig;
}

export function ThemeProvider({
  children,
  defaultSystemTheme = DEFAULT_THEME,
  defaultMode = DEFAULT_MODE,
  defaultAccent = DEFAULT_ACCENT,
  storageKey = "autoflow-theme",
}: ThemeProviderProps) {
  const [systemTheme, setSystemThemeState] = useState<SystemTheme>(defaultSystemTheme);
  const [mode, setModeState] = useState<Mode>(defaultMode);
  const [accent, setAccentState] = useState<Accent>(defaultAccent);
  const [background, setBackgroundState] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const [resolvedMode, setResolvedMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Get current theme definition
  const themeDefinition = themes[systemTheme];

  // Get system preference
  const getSystemMode = useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Resolve actual mode
  const resolveMode = useCallback(
    (m: Mode): "dark" | "light" => {
      return m === "system" ? getSystemMode() : m;
    },
    [getSystemMode]
  );

  // Load saved theme on mount (backward compatible with accent migration)
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) {
      try {
        const parsed: PersistedTheme = JSON.parse(savedTheme);
        if (parsed.mode) setModeState(parsed.mode);
        // Migrate legacy accent names (orange→amber, purple→violet, pink→rose, slate→cyan)
        if (parsed.accent) {
          const migratedAccent = migrateAccent(parsed.accent);
          setAccentState(migratedAccent);
        }
        // New: load system theme if present, otherwise default to 'autoflow'
        if (parsed.systemTheme && themes[parsed.systemTheme]) {
          setSystemThemeState(parsed.systemTheme);
        }
        // Load background config
        if (parsed.background) {
          setBackgroundState(parsed.background);
        }
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setMounted(true);
  }, [storageKey]);

  // Update resolved mode when mode or system preference changes
  useEffect(() => {
    if (!mounted) return;

    const resolved = resolveMode(mode);
    setResolvedMode(resolved);

    // Apply mode class to html element
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
  }, [mode, mounted, resolveMode]);

  // Apply system theme data attribute
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.setAttribute("data-theme", systemTheme);
  }, [systemTheme, mounted]);

  // Apply accent class
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Remove all accent classes (new + legacy names)
    root.classList.remove(
      // New palette
      "accent-cyan",
      "accent-blue",
      "accent-emerald",
      "accent-amber",
      "accent-violet",
      "accent-rose",
      // Legacy names (for cleanup)
      "accent-orange",
      "accent-purple",
      "accent-pink",
      "accent-slate"
    );
    root.classList.add(`accent-${accent}`);
  }, [accent, mounted]);

  // Apply background (only in dark mode)
  useEffect(() => {
    if (!mounted) return;

    const body = document.body;

    if (resolvedMode === "light") {
      // Light mode: use CSS variable
      body.style.background = "var(--bg)";
    } else {
      // Dark mode: apply user's background choice
      if (background.type === "solid") {
        body.style.background = background.solid;
      } else {
        const { from, to, angle } = background.gradient;
        body.style.background = `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
      }
    }
    body.style.backgroundAttachment = "fixed";
  }, [background, resolvedMode, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setResolvedMode(getSystemMode());
      // Re-apply mode class
      const root = document.documentElement;
      root.classList.remove("dark", "light");
      root.classList.add(getSystemMode());
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode, mounted, getSystemMode]);

  // Persist theme to localStorage
  useEffect(() => {
    if (!mounted) return;
    const themeData: PersistedTheme = { mode, accent, systemTheme, background };
    localStorage.setItem(storageKey, JSON.stringify(themeData));
  }, [mode, accent, systemTheme, background, storageKey, mounted]);

  const setSystemTheme = useCallback((newTheme: SystemTheme) => {
    setSystemThemeState(newTheme);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
  }, []);

  const setBackground = useCallback((config: BackgroundConfig) => {
    setBackgroundState(config);
  }, []);

  const setBackgroundType = useCallback((type: BackgroundType) => {
    setBackgroundState((prev) => ({ ...prev, type }));
  }, []);

  const setSolidColor = useCallback((color: string) => {
    setBackgroundState((prev) => ({ ...prev, solid: color }));
  }, []);

  const setGradient = useCallback((gradient: GradientConfig) => {
    setBackgroundState((prev) => ({ ...prev, gradient }));
  }, []);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        systemTheme,
        setSystemTheme,
        mode,
        setMode,
        resolvedMode,
        accent,
        setAccent,
        background,
        setBackground,
        setBackgroundType,
        setSolidColor,
        setGradient,
        themeDefinition,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
