"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import type { ThemePreset } from "@/lib/themes/presets";
import type { CustomTheme, BackgroundConfig } from "@/types/theme";
import { cn } from "@/lib/utils";

// Accent colour map for preview
const ACCENT_COLORS: Record<string, string> = {
  cyan: "#06B6D4",
  blue: "#3B82F6",
  emerald: "#10B981",
  amber: "#F59E0B",
  indigo: "#14B8A6",
  rose: "#F43F5E",
};

interface ThemePresetCardProps {
  preset: ThemePreset | CustomTheme;
  isActive: boolean;
  isCustom?: boolean;
  currentMode: "dark" | "light";
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getBackgroundStyle(config: BackgroundConfig): React.CSSProperties {
  if (config.type === "gradient") {
    return {
      background: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.from} 0%, ${config.gradient.to} 100%)`,
    };
  }
  return {
    backgroundColor: config.solid,
  };
}

export function ThemePresetCard({
  preset,
  isActive,
  isCustom = false,
  currentMode,
  onClick,
  onEdit,
  onDelete,
}: ThemePresetCardProps) {
  const background = currentMode === "dark" ? preset.backgroundDark : preset.backgroundLight;
  const accentColor = ACCENT_COLORS[preset.accent] || ACCENT_COLORS.cyan;

  // Derive preview colours from background
  const bgStyle = getBackgroundStyle(background);
  const cardBg = currentMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const textColor = currentMode === "dark" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)";
  const mutedColor = currentMode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = currentMode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border-2 text-left transition-all",
          isActive
            ? "ring-2 ring-offset-2"
            : "hover:border-[var(--border-strong)]"
        )}
        style={{
          borderColor: isActive ? "var(--primary-color)" : "var(--border-color)",
          ["--tw-ring-color" as string]: "var(--primary-color)",
          ["--tw-ring-offset-color" as string]: "var(--bg)",
        }}
      >
        {/* Theme preview - mini UI mockup */}
        <div className="h-28 p-2" style={bgStyle}>
          <div className="flex h-full gap-1.5">
            {/* Mini sidebar */}
            <div
              className="w-8 rounded-sm p-1"
              style={{ backgroundColor: cardBg }}
            >
              {/* Nav items */}
              <div
                className="mb-1 h-2 w-full rounded-sm"
                style={{ backgroundColor: accentColor }}
              />
              <div
                className="mb-1 h-2 w-full rounded-sm"
                style={{ backgroundColor: mutedColor }}
              />
              <div
                className="h-2 w-full rounded-sm"
                style={{ backgroundColor: mutedColor }}
              />
            </div>

            {/* Mini content area */}
            <div className="flex-1 space-y-1.5">
              {/* Header */}
              <div
                className="h-3 w-16 rounded-sm"
                style={{ backgroundColor: textColor, opacity: 0.3 }}
              />

              {/* Cards row */}
              <div className="flex gap-1">
                <div
                  className="h-8 flex-1 rounded-sm"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="m-1 h-1.5 w-6 rounded-sm"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div
                  className="h-8 flex-1 rounded-sm"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="m-1 h-1.5 w-4 rounded-sm"
                    style={{ backgroundColor: mutedColor }}
                  />
                </div>
              </div>

              {/* Another row */}
              <div className="flex gap-1">
                <div
                  className="h-6 flex-1 rounded-sm"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <div
                  className="h-6 flex-1 rounded-sm"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <div
                  className="h-6 flex-1 rounded-sm"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme info */}
        <div
          className="border-t p-3"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {preset.name}
              </p>
              {isCustom && (
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Custom theme
                </p>
              )}
            </div>

            {/* Active indicator */}
            {isActive && (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Edit/Delete buttons for custom themes */}
      {isCustom && (onEdit || onDelete) && (
        <div
          className={cn(
            "absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity",
            "group-hover:opacity-100"
          )}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-md bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Edit theme"
            >
              <Pencil className="h-3.5 w-3.5 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-md bg-black/50 hover:bg-red-600/80 transition-colors"
              aria-label="Delete theme"
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
