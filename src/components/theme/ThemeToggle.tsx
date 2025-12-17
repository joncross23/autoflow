"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";

const modes = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

const accents = [
  { value: "blue", label: "Midnight Blue", color: "#3B82F6" },
  { value: "emerald", label: "Emerald Green", color: "#10B981" },
  { value: "orange", label: "Sunset Orange", color: "#F59E0B" },
  { value: "purple", label: "Royal Purple", color: "#8B5CF6" },
  { value: "pink", label: "Rose Pink", color: "#EC4899" },
  { value: "slate", label: "Slate Grey", color: "#64748B" },
] as const;

export function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      {/* Mode selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-secondary">
          Appearance
        </label>
        <div className="flex gap-2">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`btn flex items-center gap-2 ${
                mode === value ? "btn-primary" : "btn-secondary"
              }`}
              aria-pressed={mode === value}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent colour selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-secondary">
          Accent Colour
        </label>
        <div className="flex flex-wrap gap-2">
          {accents.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setAccent(value)}
              className={`flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                accent === value
                  ? "border-primary bg-primary-muted"
                  : "border-border hover:border-primary"
              }`}
              aria-pressed={accent === value}
              title={label}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
