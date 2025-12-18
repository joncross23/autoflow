"use client";

import { Check } from "lucide-react";
import type { ThemeDefinition } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemeCardProps {
  theme: ThemeDefinition;
  isActive: boolean;
  onClick: () => void;
  currentMode: "dark" | "light";
}

export function ThemeCard({
  theme,
  isActive,
  onClick,
  currentMode,
}: ThemeCardProps) {
  const colors = theme.modes[currentMode];
  const accent = theme.accents.blue; // Use blue for preview

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-lg border-2 text-left transition-all",
        isActive
          ? "ring-2 ring-offset-2"
          : "hover:border-[var(--border-strong)]"
      )}
      style={{
        borderColor: isActive ? "var(--primary-color)" : "var(--border-color)",
        borderRadius: "var(--radius-lg)",
        ["--tw-ring-color" as string]: "var(--primary-color)",
        ["--tw-ring-offset-color" as string]: "var(--bg)",
      }}
    >
      {/* Theme preview */}
      <div
        className="h-28 p-2"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex h-full gap-1.5">
          {/* Mini sidebar */}
          <div
            className="w-8 rounded-sm p-1"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            {/* Nav items */}
            <div
              className="mb-1 h-2 w-full rounded-sm"
              style={{ backgroundColor: accent.primary }}
            />
            <div
              className="mb-1 h-2 w-full rounded-sm"
              style={{ backgroundColor: colors.bgTertiary }}
            />
            <div
              className="h-2 w-full rounded-sm"
              style={{ backgroundColor: colors.bgTertiary }}
            />
          </div>

          {/* Mini content area */}
          <div className="flex-1 space-y-1.5">
            {/* Header */}
            <div
              className="h-3 w-16 rounded-sm"
              style={{ backgroundColor: colors.text, opacity: 0.3 }}
            />

            {/* Cards row */}
            <div className="flex gap-1">
              <div
                className="h-8 flex-1 rounded-sm"
                style={{
                  backgroundColor: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="m-1 h-1.5 w-6 rounded-sm"
                  style={{ backgroundColor: accent.primary }}
                />
              </div>
              <div
                className="h-8 flex-1 rounded-sm"
                style={{
                  backgroundColor: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="m-1 h-1.5 w-4 rounded-sm"
                  style={{ backgroundColor: colors.textMuted }}
                />
              </div>
            </div>

            {/* Another row */}
            <div className="flex gap-1">
              <div
                className="h-6 flex-1 rounded-sm"
                style={{
                  backgroundColor: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                }}
              />
              <div
                className="h-6 flex-1 rounded-sm"
                style={{
                  backgroundColor: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                }}
              />
              <div
                className="h-6 flex-1 rounded-sm"
                style={{
                  backgroundColor: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
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
              {theme.name}
            </p>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {theme.description}
            </p>
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
  );
}
