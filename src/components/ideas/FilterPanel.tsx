"use client";

import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, STATUS_CONFIG } from "./StatusBadge";
import type { IdeaStatus } from "@/types/database";

export interface IdeaFilters {
  statuses: IdeaStatus[];
  archived: boolean;
  dateRange: "all" | "today" | "week" | "month" | "quarter";
  search: string;
}

interface FilterPanelProps {
  filters: IdeaFilters;
  onFiltersChange: (filters: IdeaFilters) => void;
  ideaCounts?: Record<IdeaStatus, number>;
}

const ALL_STATUSES: IdeaStatus[] = [
  "new",
  "evaluating",
  "accepted",
  "doing",
  "complete",
  "parked",
  "dropped",
];

const DATE_RANGE_OPTIONS: { value: IdeaFilters["dateRange"]; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  ideaCounts,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount =
    filters.statuses.length +
    (filters.archived ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0);

  const toggleStatus = (status: IdeaStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const clearFilters = () => {
    onFiltersChange({
      statuses: [],
      archived: false,
      dateRange: "all",
      search: "",
    });
  };

  return (
    <div className="mb-4">
      {/* Compact filter bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
            expanded
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-bg-hover"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>

        {/* Quick status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ALL_STATUSES.slice(0, 4).map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm transition-colors whitespace-nowrap",
                filters.statuses.includes(status)
                  ? "border-primary bg-primary/10"
                  : "border-border-subtle hover:bg-bg-hover"
              )}
            >
              <StatusBadge status={status} size="sm" />
              {ideaCounts && (
                <span className="text-muted-foreground text-xs">
                  ({ideaCounts[status] || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="mt-3 p-4 rounded-lg border border-border bg-bg-secondary">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Status filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Status</h4>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm transition-colors",
                      filters.statuses.includes(status)
                        ? "border-primary bg-primary/10"
                        : "border-border-subtle hover:bg-bg-hover"
                    )}
                  >
                    <StatusBadge status={status} size="sm" />
                    {ideaCounts && (
                      <span className="text-muted-foreground text-xs">
                        {ideaCounts[status] || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Date Range</h4>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: e.target.value as IdeaFilters["dateRange"],
                  })
                }
                className="input w-full"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Archive toggle */}
            <div>
              <h4 className="text-sm font-medium mb-3">Archive</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.archived}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, archived: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border bg-bg-secondary text-primary"
                />
                <span className="text-sm">Show archived ideas</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const DEFAULT_FILTERS: IdeaFilters = {
  statuses: [],
  archived: false,
  dateRange: "all",
  search: "",
};
