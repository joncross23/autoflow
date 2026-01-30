"use client";

/**
 * DateRangeControl
 * Preset date options for quick filtering
 */

import { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterOption } from "../types";

interface DateRangeControlProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export function DateRangeControl({
  isOpen,
  onClose,
  options,
  selected,
  onSelect,
}: DateRangeControlProps) {
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

  return (
    <div
      ref={containerRef}
      className="w-48 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-1">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
                isSelected
                  ? "bg-teal-500/20 text-teal-400"
                  : "hover:bg-bg-hover"
              )}
            >
              {option.label}
              {isSelected && <Check className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
