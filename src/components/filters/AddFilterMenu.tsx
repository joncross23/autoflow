"use client";

/**
 * AddFilterMenu
 * Dropdown menu showing available filter types
 */

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CHIP_COLOR_CLASSES, type FilterDefinition } from "./types";

interface AddFilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  filterDefinitions: FilterDefinition[];
  existingTypes: string[];
  onSelectType: (definition: FilterDefinition) => void;
}

export function AddFilterMenu({
  isOpen,
  onClose,
  filterDefinitions,
  existingTypes,
  onSelectType,
}: AddFilterMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter out types that already have active filters (except multiSelect which can have multiple)
  const availableFilters = filterDefinitions.filter((def) => {
    // Boolean filters can only be added once
    if (def.control === "boolean" && existingTypes.includes(def.type)) {
      return false;
    }
    // Other filters can be re-selected to modify
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="w-56 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-1">
        <div className="px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
          Add Filter
        </div>
        {availableFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = existingTypes.includes(filter.type);
          return (
            <button
              key={filter.type}
              onClick={() => onSelectType(filter)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
                isActive ? "bg-bg-hover" : "hover:bg-bg-hover"
              )}
            >
              <span
                className={cn(
                  "p-1.5 rounded",
                  CHIP_COLOR_CLASSES[filter.chipColor]
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="flex-1">{filter.label}</span>
              {isActive && (
                <span className="text-xs text-foreground-muted">Active</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
