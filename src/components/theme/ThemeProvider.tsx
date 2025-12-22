"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Mode, Accent, ThemeDefinition } from "@/lib/themes";
import { themes, DEFAULT_MODE, DEFAULT_ACCENT, migrateAccent } from "@/lib/themes";
import { DEFAULT_THEME_PRESETS, getThemePreset, getDefaultThemePreset } from "@/lib/themes/presets";
import type { ThemePreset } from "@/lib/themes/presets";
import type { BackgroundConfig, CustomTheme, CustomGradient, UserThemePreferences, CUSTOM_LIMITS } from "@/types/theme";
import { createClient } from "@/lib/supabase/client";

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "autoflow-theme-v16";

const DEFAULT_PRESET = getDefaultThemePreset();

export const DEFAULT_BACKGROUND_DARK: BackgroundConfig = DEFAULT_PRESET.backgroundDark;
export const DEFAULT_BACKGROUND_LIGHT: BackgroundConfig = DEFAULT_PRESET.backgroundLight;

// Legacy gradients for backward compatibility
export const PRESET_GRADIENTS: { name: string; config: { from: string; to: string; angle: number } }[] = [
  { name: "Ocean", config: { from: "#1e3a5f", to: "#0d1f2d", angle: 135 } },
  { name: "Forest", config: { from: "#14352a", to: "#0a1810", angle: 135 } },
  { name: "Ember", config: { from: "#3d1c1c", to: "#1a0a0a", angle: 135 } },
  { name: "Midnight", config: { from: "#1e293b", to: "#0f172a", angle: 135 } },
  { name: "Rose", config: { from: "#3f1d2a", to: "#1a0a10", angle: 135 } },
  { name: "Slate", config: { from: "#262626", to: "#171717", angle: 135 } },
];

// ============================================
// Context Type
// ============================================

interface ThemeContextType {
  // Active theme
  activeThemeId: string;
  setActiveTheme: (id: string) => void;

  // Mode (dark, light, system)
  mode: Mode;
  setMode: (mode: Mode) => void;
  resolvedMode: "dark" | "light";

  // Accent colour
  accent: Accent;
  setAccent: (accent: Accent) => void;

  // Background (separate for dark and light)
  backgroundDark: BackgroundConfig;
  backgroundLight: BackgroundConfig;
  setBackgroundDark: (config: BackgroundConfig) => void;
  setBackgroundLight: (config: BackgroundConfig) => void;

  // Custom themes
  customThemes: CustomTheme[];
  saveCustomTheme: (name: string) => Promise<CustomTheme | null>;
  updateCustomTheme: (id: string, updates: Partial<Omit<CustomTheme, "id">>) => Promise<void>;
  deleteCustomTheme: (id: string) => Promise<void>;

  // Custom gradients
  customGradients: CustomGradient[];
  saveCustomGradient: (gradient: Omit<CustomGradient, "id">) => Promise<CustomGradient | null>;
  deleteCustomGradient: (id: string) => Promise<void>;

  // Theme presets (for reference)
  presets: ThemePreset[];

  // Current theme definition (legacy support)
  themeDefinition: ThemeDefinition;

  // Loading state
  isLoading: boolean;

  // Authenticated status
  isAuthenticated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// Local Storage Helpers
// ============================================

interface LocalThemeState {
  activeThemeId: string;
  mode: Mode;
  accent: Accent;
  backgroundDark: BackgroundConfig;
  backgroundLight: BackgroundConfig;
  customThemes: CustomTheme[];
  customGradients: CustomGradient[];
}

function loadFromLocalStorage(): LocalThemeState | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    // Migrate violet to indigo if needed
    if (parsed.accent) {
      parsed.accent = migrateAccent(parsed.accent);
    }
    return parsed;
  } catch (e) {
    // Clear corrupted data
    console.warn("[ThemeProvider] Corrupted localStorage data, clearing:", e);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors when clearing
    }
    return null;
  }
}

function saveToLocalStorage(state: LocalThemeState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ============================================
// Provider
// ============================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Load initial state from localStorage synchronously to avoid flash
  const initialState = typeof window !== "undefined" ? loadFromLocalStorage() : null;

  // State
  const [activeThemeId, setActiveThemeIdState] = useState<string>(initialState?.activeThemeId || DEFAULT_PRESET.id);
  const [mode, setModeState] = useState<Mode>(initialState?.mode || DEFAULT_MODE);
  const [accent, setAccentState] = useState<Accent>(initialState?.accent || DEFAULT_PRESET.accent);
  const [backgroundDark, setBackgroundDarkState] = useState<BackgroundConfig>(initialState?.backgroundDark || DEFAULT_BACKGROUND_DARK);
  const [backgroundLight, setBackgroundLightState] = useState<BackgroundConfig>(initialState?.backgroundLight || DEFAULT_BACKGROUND_LIGHT);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(initialState?.customThemes || []);
  const [customGradients, setCustomGradients] = useState<CustomGradient[]>(initialState?.customGradients || []);
  const [resolvedMode, setResolvedMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Theme definition (for legacy support)
  const themeDefinition = themes.autoflow;

  // Set mounted immediately on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get system preference
  const getSystemMode = useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Resolve actual mode
  const resolveMode = useCallback(
    (m: Mode): "dark" | "light" => {
      return m === "system" ? getSystemMode() : m;
    },
    [getSystemMode]
  );

  // Load state from Supabase or localStorage
  useEffect(() => {
    async function loadState() {
      try {
        const supabase = createClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setUserId(user?.id || null);

        if (user) {
          // Try to load from Supabase
          try {
            const { data, error } = await supabase
              .from("user_theme_preferences")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (data && !error) {
              setActiveThemeIdState(data.active_theme_id);
              setModeState(data.mode as Mode);
              setAccentState(migrateAccent(data.accent));
              setBackgroundDarkState(data.background_dark);
              setBackgroundLightState(data.background_light);
              setCustomThemes(data.custom_themes || []);
              setCustomGradients(data.custom_gradients || []);
            } else {
              // No Supabase data or table doesn't exist, use localStorage
              const local = loadFromLocalStorage();
              if (local) {
                setActiveThemeIdState(local.activeThemeId);
                setModeState(local.mode);
                setAccentState(local.accent);
                setBackgroundDarkState(local.backgroundDark);
                setBackgroundLightState(local.backgroundLight);
                setCustomThemes(local.customThemes || []);
                setCustomGradients(local.customGradients || []);
              }
            }
          } catch {
            // Table might not exist yet, fall back to localStorage
            const local = loadFromLocalStorage();
            if (local) {
              setActiveThemeIdState(local.activeThemeId);
              setModeState(local.mode);
              setAccentState(local.accent);
              setBackgroundDarkState(local.backgroundDark);
              setBackgroundLightState(local.backgroundLight);
              setCustomThemes(local.customThemes || []);
              setCustomGradients(local.customGradients || []);
            }
          }
        } else {
          // Not authenticated, use localStorage
          const local = loadFromLocalStorage();
          if (local) {
            setActiveThemeIdState(local.activeThemeId);
            setModeState(local.mode);
            setAccentState(local.accent);
            setBackgroundDarkState(local.backgroundDark);
            setBackgroundLightState(local.backgroundLight);
            setCustomThemes(local.customThemes || []);
            setCustomGradients(local.customGradients || []);
          }
        }
      } catch (err) {
        // Auth error, fall back to localStorage
        console.warn("Theme: Failed to check auth, using localStorage", err);
        const local = loadFromLocalStorage();
        if (local) {
          setActiveThemeIdState(local.activeThemeId);
          setModeState(local.mode);
          setAccentState(local.accent);
          setBackgroundDarkState(local.backgroundDark);
          setBackgroundLightState(local.backgroundLight);
          setCustomThemes(local.customThemes || []);
          setCustomGradients(local.customGradients || []);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadState();
  }, []);

  // Sync to storage when state changes
  const syncToStorage = useCallback(async () => {
    if (!mounted) return;

    const state: LocalThemeState = {
      activeThemeId,
      mode,
      accent,
      backgroundDark,
      backgroundLight,
      customThemes,
      customGradients,
    };

    // Always save to localStorage as backup
    saveToLocalStorage(state);

    // Also sync to Supabase if authenticated
    if (isAuthenticated && userId) {
      try {
        const supabase = createClient();
        await supabase
          .from("user_theme_preferences")
          .upsert({
            user_id: userId,
            active_theme_id: activeThemeId,
            mode,
            accent,
            background_dark: backgroundDark,
            background_light: backgroundLight,
            custom_themes: customThemes,
            custom_gradients: customGradients,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      } catch {
        // Supabase sync failed, localStorage is still saved
      }
    }
  }, [
    mounted,
    activeThemeId,
    mode,
    accent,
    backgroundDark,
    backgroundLight,
    customThemes,
    customGradients,
    isAuthenticated,
    userId,
  ]);

  useEffect(() => {
    syncToStorage();
  }, [syncToStorage]);

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
      "accent-cyan",
      "accent-blue",
      "accent-emerald",
      "accent-amber",
      "accent-indigo",
      "accent-rose",
      // Legacy
      "accent-violet",
      "accent-orange",
      "accent-purple",
      "accent-pink",
      "accent-slate"
    );
    root.classList.add(`accent-${accent}`);
  }, [accent, mounted]);

  // Apply background
  useEffect(() => {
    if (!mounted) return;

    const body = document.body;
    const bg = resolvedMode === "dark" ? backgroundDark : backgroundLight;

    if (bg.type === "solid") {
      body.style.background = bg.solid;
    } else {
      const { from, to, angle } = bg.gradient;
      body.style.background = `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
    }
    body.style.backgroundAttachment = "fixed";
  }, [backgroundDark, backgroundLight, resolvedMode, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = getSystemMode();
      setResolvedMode(resolved);
      const root = document.documentElement;
      root.classList.remove("dark", "light");
      root.classList.add(resolved);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode, mounted, getSystemMode]);

  // ============================================
  // Actions
  // ============================================

  const setActiveTheme = useCallback((id: string) => {
    // Check if it's a preset
    const preset = getThemePreset(id);
    if (preset) {
      setActiveThemeIdState(id);
      setAccentState(preset.accent);
      setBackgroundDarkState(preset.backgroundDark);
      setBackgroundLightState(preset.backgroundLight);
      return;
    }

    // Check if it's a custom theme
    const custom = customThemes.find((t) => t.id === id);
    if (custom) {
      setActiveThemeIdState(id);
      setAccentState(custom.accent);
      setBackgroundDarkState(custom.backgroundDark);
      setBackgroundLightState(custom.backgroundLight);
    }
  }, [customThemes]);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
  }, []);

  const setBackgroundDark = useCallback((config: BackgroundConfig) => {
    setBackgroundDarkState(config);
  }, []);

  const setBackgroundLight = useCallback((config: BackgroundConfig) => {
    setBackgroundLightState(config);
  }, []);

  const saveCustomTheme = useCallback(async (name: string): Promise<CustomTheme | null> => {
    if (customThemes.length >= 6) return null;

    const newTheme: CustomTheme = {
      id: crypto.randomUUID(),
      name,
      accent,
      backgroundDark,
      backgroundLight,
    };

    setCustomThemes((prev) => [...prev, newTheme]);
    return newTheme;
  }, [customThemes.length, accent, backgroundDark, backgroundLight]);

  const updateCustomTheme = useCallback(async (id: string, updates: Partial<Omit<CustomTheme, "id">>) => {
    setCustomThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteCustomTheme = useCallback(async (id: string) => {
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));

    // If the deleted theme was active, fall back to default
    if (activeThemeId === id) {
      const defaultPreset = getDefaultThemePreset();
      setActiveThemeIdState(defaultPreset.id);
      setAccentState(defaultPreset.accent);
      setBackgroundDarkState(defaultPreset.backgroundDark);
      setBackgroundLightState(defaultPreset.backgroundLight);
    }
  }, [activeThemeId]);

  const saveCustomGradient = useCallback(async (gradient: Omit<CustomGradient, "id">): Promise<CustomGradient | null> => {
    if (customGradients.length >= 6) return null;

    const newGradient: CustomGradient = {
      ...gradient,
      id: crypto.randomUUID(),
    };

    setCustomGradients((prev) => [...prev, newGradient]);
    return newGradient;
  }, [customGradients.length]);

  const deleteCustomGradient = useCallback(async (id: string) => {
    setCustomGradients((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        activeThemeId,
        setActiveTheme,
        mode,
        setMode,
        resolvedMode,
        accent,
        setAccent,
        backgroundDark,
        backgroundLight,
        setBackgroundDark,
        setBackgroundLight,
        customThemes,
        saveCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        customGradients,
        saveCustomGradient,
        deleteCustomGradient,
        presets: DEFAULT_THEME_PRESETS,
        themeDefinition,
        isLoading,
        isAuthenticated,
      }}
    >
      {/* Hide children until mounted to prevent flash of incorrect theme */}
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
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

// ============================================
// Legacy exports for backward compatibility
// ============================================

export type BackgroundType = "solid" | "gradient";
export type { BackgroundConfig, GradientConfig } from "@/types/theme";
export const DEFAULT_BACKGROUND = DEFAULT_BACKGROUND_DARK;
