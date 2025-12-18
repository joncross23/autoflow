"use client";

import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ThemeCard } from "@/components/theme/ThemeCard";
import { themeList } from "@/lib/themes";
import type { Mode, Accent } from "@/lib/themes";
import { cn } from "@/lib/utils";

const modeOptions: { value: Mode; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

const accentOptions: { value: Accent; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Emerald" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "slate", label: "Slate" },
];

export function AppearanceSettings() {
  const {
    systemTheme,
    setSystemTheme,
    mode,
    setMode,
    resolvedMode,
    accent,
    setAccent,
    themeDefinition,
  } = useTheme();

  // Get the current accent colors for preview
  const currentAccentColors = themeDefinition.accents[accent];

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <section>
        <h2
          className="mb-1 text-lg font-semibold"
          style={{ color: "var(--text)" }}
        >
          Theme
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Choose a theme that suits your style
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {themeList.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={systemTheme === theme.id}
              onClick={() => setSystemTheme(theme.id)}
              currentMode={resolvedMode}
            />
          ))}
        </div>
      </section>

      {/* Mode Selection */}
      <section>
        <h2
          className="mb-1 text-lg font-semibold"
          style={{ color: "var(--text)" }}
        >
          Appearance
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Select dark or light mode, or sync with your system
        </p>

        <div
          className="inline-flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all"
                )}
                style={{
                  backgroundColor: isActive ? "var(--bg-elevated)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-secondary)",
                  boxShadow: isActive ? "0 1px 2px var(--shadow-light)" : "none",
                }}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Accent Color Selection */}
      <section>
        <h2
          className="mb-1 text-lg font-semibold"
          style={{ color: "var(--text)" }}
        >
          Accent Colour
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Choose your preferred accent colour
        </p>

        <div className="flex flex-wrap gap-3">
          {accentOptions.map((option) => {
            const isActive = accent === option.value;
            const accentColors = themeDefinition.accents[option.value];

            return (
              <button
                key={option.value}
                onClick={() => setAccent(option.value)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
                  isActive ? "ring-2 ring-offset-2" : "hover:bg-[var(--bg-hover)]"
                )}
                style={{
                  backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                  ["--tw-ring-color" as string]: accentColors.primary,
                  ["--tw-ring-offset-color" as string]: "var(--bg)",
                }}
              >
                {/* Color circle */}
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: accentColors.primary }}
                >
                  {isActive && <Check className="h-5 w-5 text-white" />}
                </div>

                {/* Label */}
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? "var(--text)" : "var(--text-secondary)",
                  }}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preview */}
      <section>
        <h2
          className="mb-1 text-lg font-semibold"
          style={{ color: "var(--text)" }}
        >
          Preview
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          See how your selections look together
        </p>

        <div
          className="card space-y-4"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-medium"
              style={{ backgroundColor: currentAccentColors.primary }}
            >
              AF
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--text)" }}>
                AutoFlow Preview
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {themeDefinition.name} theme with {accent} accent
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              style={{ borderRadius: "var(--radius)" }}
            >
              Primary Button
            </button>
            <button
              className="btn btn-secondary"
              style={{ borderRadius: "var(--radius)" }}
            >
              Secondary
            </button>
            <button
              className="btn btn-outline"
              style={{ borderRadius: "var(--radius)" }}
            >
              Outline
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-error">Error</span>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <div
              className="h-full w-2/3 rounded-full"
              style={{ backgroundColor: currentAccentColors.primary }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
