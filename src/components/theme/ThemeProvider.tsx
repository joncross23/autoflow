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
    const themeData: PersistedTheme = { mode, accent, systemTheme };
    localStorage.setItem(storageKey, JSON.stringify(themeData));
  }, [mode, accent, systemTheme, storageKey, mounted]);

  const setSystemTheme = useCallback((newTheme: SystemTheme) => {
    setSystemThemeState(newTheme);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
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
