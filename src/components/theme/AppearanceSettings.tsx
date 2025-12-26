"use client";

import { useState } from "react";
import { Moon, Sun, Monitor, Check, Palette, Layers, Plus, Settings2 } from "lucide-react";
import { useTheme, PRESET_GRADIENTS } from "@/components/theme/ThemeProvider";
import { ThemePresetCard } from "@/components/theme/ThemePresetCard";
import { EyedropperButton } from "@/components/theme/EyedropperButton";
import { SlideOutPanel } from "@/components/ui/SlideOutPanel";
import type { Mode, Accent } from "@/lib/themes";
import type { BackgroundConfig, GradientConfig } from "@/types/theme";
import { cn } from "@/lib/utils";

// ============================================
// Constants
// ============================================

const modeOptions: { value: Mode; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

const accentOptions: { value: Accent; label: string; color: string }[] = [
  { value: "cyan", label: "Cyan", color: "#06B6D4" },
  { value: "blue", label: "Blue", color: "#3B82F6" },
  { value: "emerald", label: "Emerald", color: "#10B981" },
  { value: "amber", label: "Amber", color: "#F59E0B" },
  { value: "indigo", label: "Indigo", color: "#6366F1" },
  { value: "rose", label: "Rose", color: "#F43F5E" },
];

// ============================================
// Component
// ============================================

export function AppearanceSettings() {
  const {
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
    deleteCustomTheme,
    customGradients,
    saveCustomGradient,
    deleteCustomGradient,
    presets,
    themeDefinition,
  } = useTheme();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customThemeName, setCustomThemeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Current background based on mode
  const currentBackground = resolvedMode === "dark" ? backgroundDark : backgroundLight;
  const setCurrentBackground = resolvedMode === "dark" ? setBackgroundDark : setBackgroundLight;

  // Get accent colours for preview
  const currentAccentColors = themeDefinition.accents[accent];

  // Handle save custom theme
  const handleSaveCustomTheme = async () => {
    if (!customThemeName.trim() || customThemes.length >= 6) return;

    setIsSaving(true);
    try {
      await saveCustomTheme(customThemeName.trim());
      setCustomThemeName("");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save custom gradient
  const handleSaveGradient = async () => {
    if (customGradients.length >= 6) return;

    await saveCustomGradient({
      from: currentBackground.gradient.from,
      to: currentBackground.gradient.to,
      angle: currentBackground.gradient.angle,
    });
  };

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <section>
        <h2 className="mb-1 text-lg font-semibold" style={{ color: "var(--text)" }}>
          Appearance
        </h2>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
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
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all"
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

      {/* Theme Presets */}
      <section>
        <h2 className="mb-1 text-lg font-semibold" style={{ color: "var(--text)" }}>
          Theme
        </h2>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Choose a theme that suits your style
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <ThemePresetCard
              key={preset.id}
              preset={preset}
              isActive={activeThemeId === preset.id}
              currentMode={resolvedMode}
              onClick={() => setActiveTheme(preset.id)}
            />
          ))}
        </div>
      </section>

      {/* Custom Themes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Custom Themes
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {customThemes.length}/6 custom themes
            </p>
          </div>

          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
            }}
          >
            <Settings2 className="h-4 w-4" />
            Customise
          </button>
        </div>

        {customThemes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customThemes.map((theme) => (
              <ThemePresetCard
                key={theme.id}
                preset={theme}
                isActive={activeThemeId === theme.id}
                isCustom
                currentMode={resolvedMode}
                onClick={() => setActiveTheme(theme.id)}
                onDelete={() => deleteCustomTheme(theme.id)}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--border-color)" }}
          >
            <Palette className="h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No custom themes yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Click &quot;Customise&quot; to create one
            </p>
          </div>
        )}
      </section>

      {/* Customisation Panel */}
      <SlideOutPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Customise Theme"
        width="lg"
      >
        <div className="space-y-8">
          {/* Accent Colour */}
          <section>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--text)" }}>
              Accent Colour
            </h3>

            <div className="flex flex-wrap gap-3">
              {accentOptions.map((option) => {
                const isActive = accent === option.value;

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
                      ["--tw-ring-color" as string]: option.color,
                      ["--tw-ring-offset-color" as string]: "var(--bg-secondary)",
                    }}
                  >
                    <div
                      className="relative flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: option.color }}
                    >
                      {isActive && <Check className="h-5 w-5 text-white" />}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}

              {/* Eyedropper - applies picked colour to background */}
              <EyedropperButton
                onColorPicked={(hex) => {
                  // Apply to current background based on type
                  if (currentBackground.type === "gradient") {
                    // Apply to gradient start colour
                    setCurrentBackground({
                      ...currentBackground,
                      gradient: { ...currentBackground.gradient, from: hex },
                    });
                  } else {
                    // Apply to solid colour
                    setCurrentBackground({ ...currentBackground, solid: hex });
                  }
                }}
                className="self-start mt-3"
              />
            </div>
          </section>

          {/* Background */}
          <section>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--text)" }}>
              Background ({resolvedMode === "dark" ? "Dark Mode" : "Light Mode"})
            </h3>

            {/* Type Toggle */}
            <div
              className="inline-flex gap-1 rounded-lg p-1 mb-4"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <button
                onClick={() =>
                  setCurrentBackground({ ...currentBackground, type: "solid" })
                }
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    currentBackground.type === "solid" ? "var(--bg-elevated)" : "transparent",
                  color:
                    currentBackground.type === "solid"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                }}
              >
                <Palette className="h-4 w-4" />
                Solid
              </button>
              <button
                onClick={() =>
                  setCurrentBackground({ ...currentBackground, type: "gradient" })
                }
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    currentBackground.type === "gradient" ? "var(--bg-elevated)" : "transparent",
                  color:
                    currentBackground.type === "gradient"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                }}
              >
                <Layers className="h-4 w-4" />
                Gradient
              </button>
            </div>

            {/* Gradient Presets */}
            {currentBackground.type === "gradient" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_GRADIENTS.map((preset) => {
                    const isActive =
                      currentBackground.gradient.from === preset.config.from &&
                      currentBackground.gradient.to === preset.config.to;

                    return (
                      <button
                        key={preset.name}
                        onClick={() =>
                          setCurrentBackground({
                            ...currentBackground,
                            gradient: preset.config,
                          })
                        }
                        className={cn(
                          "relative h-12 rounded-lg border transition-all",
                          isActive
                            ? "ring-2 ring-[var(--primary-color)] ring-offset-2 ring-offset-[var(--bg-secondary)]"
                            : "hover:opacity-90"
                        )}
                        style={{
                          background: `linear-gradient(${preset.config.angle}deg, ${preset.config.from} 0%, ${preset.config.to} 100%)`,
                          borderColor: isActive ? "var(--primary-color)" : "var(--border-color)",
                        }}
                      >
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        )}
                        <span className="sr-only">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Gradient Controls */}
                <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      Custom Gradient
                    </span>
                    <button
                      onClick={handleSaveGradient}
                      disabled={customGradients.length >= 6}
                      className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        color: "white",
                      }}
                    >
                      Save ({customGradients.length}/6)
                    </button>
                  </div>

                  {/* Preview */}
                  <div
                    className="w-full h-12 rounded-lg border"
                    style={{
                      background: `linear-gradient(${currentBackground.gradient.angle}deg, ${currentBackground.gradient.from} 0%, ${currentBackground.gradient.to} 100%)`,
                      borderColor: "var(--border-color)",
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
                          value={currentBackground.gradient.from}
                          onChange={(e) =>
                            setCurrentBackground({
                              ...currentBackground,
                              gradient: { ...currentBackground.gradient, from: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={currentBackground.gradient.from}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                              setCurrentBackground({
                                ...currentBackground,
                                gradient: { ...currentBackground.gradient, from: val },
                              });
                            }
                          }}
                          className="flex-1 px-2 py-1 text-xs rounded border font-mono"
                          style={{
                            borderColor: "var(--border-color)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text)",
                          }}
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
                          value={currentBackground.gradient.to}
                          onChange={(e) =>
                            setCurrentBackground({
                              ...currentBackground,
                              gradient: { ...currentBackground.gradient, to: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={currentBackground.gradient.to}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                              setCurrentBackground({
                                ...currentBackground,
                                gradient: { ...currentBackground.gradient, to: val },
                              });
                            }
                          }}
                          className="flex-1 px-2 py-1 text-xs rounded border font-mono"
                          style={{
                            borderColor: "var(--border-color)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text)",
                          }}
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
                        {currentBackground.gradient.angle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={currentBackground.gradient.angle}
                      onChange={(e) =>
                        setCurrentBackground({
                          ...currentBackground,
                          gradient: {
                            ...currentBackground.gradient,
                            angle: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: "var(--bg-secondary)",
                      }}
                    />
                  </div>
                </div>

                {/* Saved Gradients */}
                {customGradients.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Saved Gradients
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {customGradients.map((gradient) => (
                        <button
                          key={gradient.id}
                          onClick={() =>
                            setCurrentBackground({
                              ...currentBackground,
                              gradient: {
                                from: gradient.from,
                                to: gradient.to,
                                angle: gradient.angle,
                              },
                            })
                          }
                          className="relative h-10 rounded-lg border group"
                          style={{
                            background: `linear-gradient(${gradient.angle}deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomGradient(gradient.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Solid Colour */}
            {currentBackground.type === "solid" && (
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={currentBackground.solid}
                  onChange={(e) =>
                    setCurrentBackground({ ...currentBackground, solid: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={currentBackground.solid}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setCurrentBackground({ ...currentBackground, solid: val });
                    }
                  }}
                  className="w-28 px-3 py-2 text-sm rounded-lg border font-mono"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text)",
                  }}
                  placeholder="#000000"
                />
                <EyedropperButton
                  onColorPicked={(hex) =>
                    setCurrentBackground({ ...currentBackground, solid: hex })
                  }
                />
              </div>
            )}
          </section>

          {/* Save as Custom Theme */}
          <section>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--text)" }}>
              Save as Custom Theme
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={customThemeName}
                onChange={(e) => setCustomThemeName(e.target.value)}
                placeholder="Theme name..."
                maxLength={20}
                className="flex-1 px-3 py-2 text-sm rounded-lg border"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={handleSaveCustomTheme}
                disabled={!customThemeName.trim() || customThemes.length >= 6 || isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                <Plus className="h-4 w-4" />
                Save ({customThemes.length}/6)
              </button>
            </div>
          </section>
        </div>
      </SlideOutPanel>
    </div>
  );
}
