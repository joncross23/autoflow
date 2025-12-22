"use client";

import { Moon, Sun, Monitor, Check, Palette, Layers } from "lucide-react";
import {
  useTheme,
  PRESET_GRADIENTS,
  PRESET_SOLIDS,
  type BackgroundType,
  type GradientConfig,
} from "@/components/theme/ThemeProvider";
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
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "violet", label: "Violet" },
  { value: "rose", label: "Rose" },
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
    background,
    setBackgroundType,
    setSolidColor,
    setGradient,
    themeDefinition,
  } = useTheme();

  const backgroundTypeOptions: { value: BackgroundType; label: string; icon: typeof Palette }[] = [
    { value: "solid", label: "Solid", icon: Palette },
    { value: "gradient", label: "Gradient", icon: Layers },
  ];

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

      {/* Background Selection (Dark Mode Only) */}
      {resolvedMode === "dark" && (
        <section>
          <h2
            className="mb-1 text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            Background
          </h2>
          <p
            className="mb-4 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Customise your dark mode background
          </p>

          {/* Type Toggle */}
          <div
            className="inline-flex gap-1 rounded-lg p-1 mb-6"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            {backgroundTypeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = background.type === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setBackgroundType(option.value)}
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

          {/* Solid Presets */}
          {background.type === "solid" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {PRESET_SOLIDS.map((preset) => {
                  const isActive = background.solid === preset.color;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => setSolidColor(preset.color)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
                        isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--bg)]" : "hover:bg-[var(--bg-hover)]"
                      )}
                      style={{
                        backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: preset.color }}
                      >
                        {isActive && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Check className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Custom:
                </span>
                <div className="relative">
                  <input
                    type="color"
                    value={background.solid}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
                <input
                  type="text"
                  value={background.solid}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setSolidColor(val);
                    }
                  }}
                  className="w-24 px-3 py-1.5 text-sm rounded-md border border-border bg-bg-secondary font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* Gradient Presets */}
          {background.type === "gradient" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_GRADIENTS.map((preset) => {
                  const isActive =
                    background.gradient.from === preset.config.from &&
                    background.gradient.to === preset.config.to;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => setGradient(preset.config)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
                        isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--bg)]" : "hover:bg-[var(--bg-hover)]"
                      )}
                      style={{
                        backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                      }}
                    >
                      <div
                        className="w-full h-16 rounded-lg border border-white/10 shadow-inner"
                        style={{
                          background: `linear-gradient(${preset.config.angle}deg, ${preset.config.from} 0%, ${preset.config.to} 100%)`,
                        }}
                      >
                        {isActive && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Check className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Gradient Picker */}
              <div
                className="p-4 rounded-lg space-y-4"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  Custom Gradient
                </div>

                {/* Preview */}
                <div
                  className="w-full h-12 rounded-lg border border-white/10"
                  style={{
                    background: `linear-gradient(${background.gradient.angle}deg, ${background.gradient.from} 0%, ${background.gradient.to} 100%)`,
                  }}
                />

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      From
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background.gradient.from}
                        onChange={(e) =>
                          setGradient({ ...background.gradient, from: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={background.gradient.from}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setGradient({ ...background.gradient, from: val });
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs rounded border border-border bg-bg-tertiary font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      To
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background.gradient.to}
                        onChange={(e) =>
                          setGradient({ ...background.gradient, to: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={background.gradient.to}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setGradient({ ...background.gradient, to: val });
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs rounded border border-border bg-bg-tertiary font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Angle Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Angle
                    </label>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {background.gradient.angle}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={background.gradient.angle}
                    onChange={(e) =>
                      setGradient({ ...background.gradient, angle: parseInt(e.target.value) })
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right,
                        hsl(0, 50%, 30%),
                        hsl(60, 50%, 30%),
                        hsl(120, 50%, 30%),
                        hsl(180, 50%, 30%),
                        hsl(240, 50%, 30%),
                        hsl(300, 50%, 30%),
                        hsl(360, 50%, 30%)
                      )`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      )}

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
