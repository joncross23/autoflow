"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";

const modes = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

const accents = [
  {
    value: "cyan",
    label: "Ocean Cyan",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #164E63 0%, #06B6D4 100%)",
  },
  {
    value: "blue",
    label: "Midnight Blue",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
  },
  {
    value: "emerald",
    label: "Emerald Green",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #064E3B 0%, #10B981 100%)",
  },
  {
    value: "amber",
    label: "Golden Amber",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #78350F 0%, #F59E0B 100%)",
  },
  {
    value: "violet",
    label: "Royal Violet",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)",
  },
  {
    value: "rose",
    label: "Coral Rose",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #881337 0%, #F43F5E 100%)",
  },
] as const;

export function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      {/* Mode selector - segmented control style */}
      <div>
        <label className="mb-3 block text-xs font-semibold text-foreground-muted uppercase tracking-wider">
          Appearance
        </label>
        <div className="inline-flex gap-1 p-1 bg-bg-tertiary rounded-xl border border-border-subtle">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                transition-all duration-200
                ${mode === value
                  ? "bg-bg-elevated text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
                }
              `}
              aria-pressed={mode === value}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent colour selector - gradient swatches */}
      <div>
        <label className="mb-3 block text-xs font-semibold text-foreground-muted uppercase tracking-wider">
          Accent Colour
        </label>
        <div className="flex flex-wrap gap-2">
          {accents.map(({ value, label, color, gradient }) => (
            <button
              key={value}
              onClick={() => setAccent(value)}
              className={`
                w-9 h-9 rounded-[10px] border-2 transition-all duration-200
                ${accent === value
                  ? "border-foreground scale-110 shadow-lg"
                  : "border-transparent hover:scale-105"
                }
              `}
              style={{
                background: gradient,
                boxShadow: accent === value ? `0 4px 12px ${color}40` : "0 2px 4px rgba(0,0,0,0.2)",
              }}
              aria-pressed={accent === value}
              title={label}
            />
          ))}
        </div>
        <p className="mt-2 text-[13px] text-foreground-secondary">
          {accents.find((a) => a.value === accent)?.label}
        </p>
      </div>
    </div>
  );
}
