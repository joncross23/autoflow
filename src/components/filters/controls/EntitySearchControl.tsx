"use client";

/**
 * EntitySearchControl
 * Searchable dropdown for selecting entities (ideas, tasks, owners)
 */

import { useState, useRef, useEffect, type ComponentType } from "react";
import { Search, Check } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface Entity {
  id: string;
  label: string;
  sublabel?: string;
}

interface EntitySearchControlProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  selected: string[];
  onToggle: (id: string) => void;
  onApply: () => void;
  title: string;
  icon?: ComponentType<LucideProps>;
  iconColor?: string;
  multiSelect?: boolean;
}

export function EntitySearchControl({
  isOpen,
  onClose,
  entities,
  selected,
  onToggle,
  onApply,
  title,
  icon: Icon,
  iconColor = "text-foreground-muted",
  multiSelect = true,
}: EntitySearchControlProps) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  const filtered = search
    ? entities.filter(
        (e) =>
          e.label.toLowerCase().includes(search.toLowerCase()) ||
          e.sublabel?.toLowerCase().includes(search.toLowerCase())
      )
    : entities;

  const handleSelect = (id: string) => {
    onToggle(id);
    if (!multiSelect) {
      onApply();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-72 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl overflow-hidden"
    >
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

      <div className="max-h-64 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-foreground-muted text-center">
            {search ? `No ${title.toLowerCase()} found` : `No ${title.toLowerCase()} available`}
          </div>
        ) : (
          filtered.map((entity) => {
            const isSelected = selected.includes(entity.id);
            return (
              <button
                key={entity.id}
                onClick={() => handleSelect(entity.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
                  isSelected ? "bg-bg-hover" : "hover:bg-bg-hover"
                )}
              >
                {multiSelect && (
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-white/20"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                {Icon && <Icon className={cn("w-4 h-4 shrink-0", iconColor)} />}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{entity.label}</div>
                  {entity.sublabel && (
                    <div className="text-xs text-foreground-muted truncate">
                      {entity.sublabel}
                    </div>
                  )}
                </div>
                {!multiSelect && isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {multiSelect && (
        <div className="p-2 border-t border-white/[0.04]">
          <button
            onClick={onApply}
            className="w-full px-3 py-1.5 text-sm font-medium bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
