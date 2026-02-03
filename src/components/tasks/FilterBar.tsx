"use client";

/**
 * FilterBar Component
 * Smart filter chips for the Task Board
 * V1.4: Dynamic filtering feature
 */

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  X,
  Lightbulb,
  Tag,
  Calendar,
  AlertCircle,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbIdea, DbLabel } from "@/types/database";

// ============================================
// FILTER TYPES
// ============================================

export type FilterType = "idea" | "label" | "dueDate" | "priority";

export interface FilterChip {
  id: string;
  type: FilterType;
  value: string; // ID for idea/label, or value like "overdue", "high"
  label: string; // Display text
  color?: string; // For labels
}

export interface DueDateOption {
  value: string;
  label: string;
}

export interface PriorityOption {
  value: string;
  label: string;
}

export const DUE_DATE_OPTIONS: DueDateOption[] = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "this-week", label: "Due this week" },
  { value: "no-date", label: "No due date" },
];

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

// ============================================
// FILTER BAR COMPONENT
// ============================================

interface FilterBarProps {
  filters: FilterChip[];
  onFiltersChange: (filters: FilterChip[]) => void;
  ideas: DbIdea[];
  labels: DbLabel[];
  className?: string;
}

export function FilterBar({
  filters,
  onFiltersChange,
  ideas,
  labels,
  className,
}: FilterBarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<FilterType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
        setActiveFilterType(null);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addFilter(chip: FilterChip) {
    // Don't add duplicate filters
    if (filters.some((f) => f.type === chip.type && f.value === chip.value)) {
      return;
    }
    onFiltersChange([...filters, chip]);
    setShowAddMenu(false);
    setActiveFilterType(null);
    setSearchQuery("");
  }

  function removeFilter(chipId: string) {
    onFiltersChange(filters.filter((f) => f.id !== chipId));
  }

  function clearAllFilters() {
    onFiltersChange([]);
  }

  // Filter ideas by search
  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter labels by search
  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get icon for filter type
  function getFilterIcon(type: FilterType) {
    switch (type) {
      case "idea":
        return <Lightbulb className="w-3 h-3" />;
      case "label":
        return <Tag className="w-3 h-3" />;
      case "dueDate":
        return <Calendar className="w-3 h-3" />;
      case "priority":
        return <AlertCircle className="w-3 h-3" />;
    }
  }

  // Get chip color based on type - softer, no borders
  function getChipClasses(chip: FilterChip) {
    switch (chip.type) {
      case "idea":
        return "bg-amber-500/15 text-amber-300";
      case "label":
        return chip.color
          ? `bg-[${chip.color}]/15 text-[${chip.color}]`
          : "bg-blue-500/15 text-blue-300";
      case "dueDate":
        return chip.value === "overdue"
          ? "bg-error/15 text-red-300"
          : "bg-teal-500/15 text-teal-300";
      case "priority":
        return chip.value === "high"
          ? "bg-error/15 text-red-300"
          : chip.value === "medium"
          ? "bg-warning/15 text-amber-300"
          : "bg-success/15 text-green-300";
      default:
        return "bg-bg-tertiary text-foreground-muted";
    }
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Active Filter Chips */}
      {filters.map((chip) => (
        <div
          key={chip.id}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
            getChipClasses(chip)
          )}
        >
          {getFilterIcon(chip.type)}
          <span className="max-w-[150px] truncate">{chip.label}</span>
          <button
            onClick={() => removeFilter(chip.id)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Add Filter Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setActiveFilterType(null);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-foreground-muted border border-dashed border-border rounded-full hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Filter
        </button>

        {/* Filter Type Menu */}
        {showAddMenu && !activeFilterType && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              <button
                onClick={() => setActiveFilterType("idea")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded hover:bg-bg-hover transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Filter by Idea
              </button>
              <button
                onClick={() => setActiveFilterType("label")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded hover:bg-bg-hover transition-colors"
              >
                <Tag className="w-4 h-4 text-blue-500" />
                Filter by Label
              </button>
              <button
                onClick={() => setActiveFilterType("dueDate")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded hover:bg-bg-hover transition-colors"
              >
                <Calendar className="w-4 h-4 text-teal-500" />
                Filter by Due Date
              </button>
              <button
                onClick={() => setActiveFilterType("priority")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded hover:bg-bg-hover transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-error" />
                Filter by Priority
              </button>
            </div>
          </div>
        )}

        {/* Idea Selector */}
        {showAddMenu && activeFilterType === "idea" && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-tertiary rounded">
                <Search className="w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ideas..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredIdeas.length === 0 ? (
                <div className="px-3 py-2 text-xs text-foreground-muted">
                  {searchQuery ? "No ideas found" : "No ideas available"}
                </div>
              ) : (
                filteredIdeas.map((idea) => {
                  const isSelected = filters.some(
                    (f) => f.type === "idea" && f.value === idea.id
                  );
                  return (
                    <button
                      key={idea.id}
                      onClick={() =>
                        addFilter({
                          id: `idea-${idea.id}`,
                          type: "idea",
                          value: idea.id,
                          label: idea.title,
                        })
                      }
                      disabled={isSelected}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded transition-colors",
                        isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-bg-hover"
                      )}
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate flex-1">{idea.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Label Selector */}
        {showAddMenu && activeFilterType === "label" && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-tertiary rounded">
                <Search className="w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search labels..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredLabels.length === 0 ? (
                <div className="px-3 py-2 text-xs text-foreground-muted">
                  {searchQuery ? "No labels found" : "No labels available"}
                </div>
              ) : (
                filteredLabels.map((label) => {
                  const isSelected = filters.some(
                    (f) => f.type === "label" && f.value === label.id
                  );
                  return (
                    <button
                      key={label.id}
                      onClick={() =>
                        addFilter({
                          id: `label-${label.id}`,
                          type: "label",
                          value: label.id,
                          label: label.name || "Unnamed label",
                          color: label.color,
                        })
                      }
                      disabled={isSelected}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded transition-colors",
                        isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-bg-hover"
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate flex-1">
                        {label.name || "Unnamed"}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Due Date Selector */}
        {showAddMenu && activeFilterType === "dueDate" && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              {DUE_DATE_OPTIONS.map((option) => {
                const isSelected = filters.some(
                  (f) => f.type === "dueDate" && f.value === option.value
                );
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      addFilter({
                        id: `dueDate-${option.value}`,
                        type: "dueDate",
                        value: option.value,
                        label: option.label,
                      })
                    }
                    disabled={isSelected}
                    className={cn(
                      "flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left rounded transition-colors",
                      isSelected
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-bg-hover"
                    )}
                  >
                    {option.label}
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority Selector */}
        {showAddMenu && activeFilterType === "priority" && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-bg-elevated border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = filters.some(
                  (f) => f.type === "priority" && f.value === option.value
                );
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      addFilter({
                        id: `priority-${option.value}`,
                        type: "priority",
                        value: option.value,
                        label: option.label,
                      })
                    }
                    disabled={isSelected}
                    className={cn(
                      "flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left rounded transition-colors",
                      isSelected
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-bg-hover"
                    )}
                  >
                    {option.label}
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {filters.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
