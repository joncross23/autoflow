"use client";

/**
 * FilterChip
 * Displays an active filter as a removable colour-coded chip
 * Click body to edit, click X to remove
 */

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHIP_COLOR_CLASSES, type ChipColor } from "./types";
import { getFilterDefinition } from "./definitions";

interface FilterChipProps {
  type: string;
  displayLabel: string;
  chipColor?: ChipColor;
  customColor?: string;
  onRemove: () => void;
  onEdit?: () => void;
}

export function FilterChip({
  type,
  displayLabel,
  chipColor,
  customColor,
  onRemove,
  onEdit,
}: FilterChipProps) {
  const definition = getFilterDefinition(type);
  const Icon = definition?.icon;
  const color = chipColor || definition?.chipColor || "slate";

  // Use custom colour for labels with specific colours
  const chipStyle = customColor
    ? {
        backgroundColor: `${customColor}20`,
        color: customColor,
        borderColor: `${customColor}30`,
      }
    : undefined;

  const chipClasses = customColor
    ? "border"
    : cn("border", CHIP_COLOR_CLASSES[color]);

  // Boolean filters can't be edited, only removed
  const isEditable = definition?.control !== "boolean" && onEdit;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full",
        chipClasses,
        isEditable && "cursor-pointer hover:opacity-80"
      )}
      style={chipStyle}
      onClick={isEditable ? onEdit : undefined}
      role={isEditable ? "button" : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={isEditable ? (e) => e.key === "Enter" && onEdit?.() : undefined}
    >
      {Icon && <Icon className="w-3 h-3" />}
      <span className="max-w-[120px] truncate">{displayLabel}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label={`Remove ${displayLabel} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
