"use client";

/**
 * MultiSelectControl
 * Checkbox list with optional search for selecting multiple values
 */

import { useState, useRef, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterOption } from "../types";

interface MultiSelectControlProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onApply: () => void;
  title: string;
  searchable?: boolean;
}

export function MultiSelectControl({
  isOpen,
  onClose,
  options,
  selected,
  onToggle,
  onApply,
  title,
  searchable = false,
}: MultiSelectControlProps) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onApply();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onApply]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onApply();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onApply]);

  if (!isOpen) return null;

  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div
      ref={containerRef}
      className="w-64 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
    >
      {searchable && (
        <div className="p-2 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-tertiary rounded-md">
            <Search className="w-4 h-4 text-foreground-muted" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-foreground-muted"
            />
          </div>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-2 text-xs text-foreground-muted">
            {search ? `No ${title.toLowerCase()} found` : `No ${title.toLowerCase()} available`}
          </div>
        ) : (
          filtered.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => onToggle(option.value)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md hover:bg-bg-hover transition-colors"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-white/20"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                {option.color && (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="flex-1 truncate">{option.label}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="p-2 border-t border-white/[0.04]">
        <button
          onClick={onApply}
          className="w-full px-3 py-1.5 text-sm font-medium bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
