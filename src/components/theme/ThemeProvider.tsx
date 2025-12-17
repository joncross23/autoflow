"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Mode = "dark" | "light" | "system";
type Accent = "blue" | "emerald" | "orange" | "purple" | "pink" | "slate";

interface ThemeContextType {
  mode: Mode;
  accent: Accent;
  resolvedMode: "dark" | "light";
  setMode: (mode: Mode) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: Mode;
  defaultAccent?: Accent;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = "dark",
  defaultAccent = "blue",
  storageKey = "autoflow-theme",
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<Mode>(defaultMode);
  const [accent, setAccentState] = useState<Accent>(defaultAccent);
  const [resolvedMode, setResolvedMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

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

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) {
      try {
        const { mode: savedMode, accent: savedAccent } = JSON.parse(savedTheme);
        if (savedMode) setModeState(savedMode);
        if (savedAccent) setAccentState(savedAccent);
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

  // Apply accent class
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Remove all accent classes
    root.classList.remove(
      "accent-blue",
      "accent-emerald",
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
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode, mounted, getSystemMode]);

  // Persist theme to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, JSON.stringify({ mode, accent }));
  }, [mode, accent, storageKey, mounted]);

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
      value={{ mode, accent, resolvedMode, setMode, setAccent }}
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
