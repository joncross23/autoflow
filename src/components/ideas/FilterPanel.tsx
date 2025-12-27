"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Tag, User, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, STATUS_CONFIG } from "./StatusBadge";
import type { IdeaStatus, PlanningHorizon, EffortEstimate, DbLabel, ContentType } from "@/types/database";

export interface IdeaFilters {
  statuses: IdeaStatus[];
  horizons: PlanningHorizon[];
  labelIds: string[];
  owners: string[];
  efforts: EffortEstimate[];
  contentTypes: (ContentType | "unset")[];
  archived: boolean;
  dateRange: "all" | "today" | "week" | "month" | "quarter";
  search: string;
}

interface FilterPanelProps {
  filters: IdeaFilters;
  onFiltersChange: (filters: IdeaFilters) => void;
  ideaCounts?: Record<IdeaStatus, number>;
  availableLabels?: DbLabel[];
  availableOwners?: string[];
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

const ALL_HORIZONS: { value: PlanningHorizon; label: string; color: string }[] = [
  { value: "now", label: "Now", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "next", label: "Next", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "later", label: "Later", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  { value: null, label: "Unplanned", color: "bg-bg-tertiary text-muted-foreground" },
];

const ALL_EFFORTS: { value: EffortEstimate; label: string }[] = [
  { value: "trivial", label: "Trivial" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
];

export const DEFAULT_FILTERS: IdeaFilters = {
  statuses: [],
  horizons: [],
  labelIds: [],
  owners: [],
  efforts: [],
  contentTypes: [],
  archived: false,
  dateRange: "all",
  search: "",
};

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
  availableLabels = [],
  availableOwners = [],
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount =
    filters.statuses.length +
    filters.horizons.length +
    filters.labelIds.length +
    filters.owners.length +
    filters.efforts.length +
    filters.contentTypes.length +
    (filters.archived ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0);

  const toggleStatus = (status: IdeaStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const toggleHorizon = (horizon: PlanningHorizon) => {
    const newHorizons = filters.horizons.includes(horizon)
      ? filters.horizons.filter((h) => h !== horizon)
      : [...filters.horizons, horizon];
    onFiltersChange({ ...filters, horizons: newHorizons });
  };

  const toggleLabel = (labelId: string) => {
    const newLabelIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    onFiltersChange({ ...filters, labelIds: newLabelIds });
  };

  const toggleOwner = (owner: string) => {
    const newOwners = filters.owners.includes(owner)
      ? filters.owners.filter((o) => o !== owner)
      : [...filters.owners, owner];
    onFiltersChange({ ...filters, owners: newOwners });
  };

  const toggleEffort = (effort: EffortEstimate) => {
    const newEfforts = filters.efforts.includes(effort)
      ? filters.efforts.filter((e) => e !== effort)
      : [...filters.efforts, effort];
    onFiltersChange({ ...filters, efforts: newEfforts });
  };

  const clearFilters = () => {
    onFiltersChange({
      statuses: [],
      horizons: [],
      labelIds: [],
      owners: [],
      efforts: [],
      contentTypes: [],
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Horizon filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Planning Horizon</h4>
              <div className="flex flex-wrap gap-2">
                {ALL_HORIZONS.map((horizon) => (
                  <button
                    key={horizon.value ?? "null"}
                    onClick={() => toggleHorizon(horizon.value)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md border text-sm transition-colors",
                      filters.horizons.includes(horizon.value)
                        ? "border-primary bg-primary/10"
                        : "border-border-subtle hover:bg-bg-hover"
                    )}
                  >
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", horizon.color)}>
                      {horizon.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Labels filter */}
            {availableLabels.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Labels
                </h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-md border text-sm transition-colors",
                        filters.labelIds.includes(label.id)
                          ? "border-primary bg-primary/10"
                          : "border-border-subtle hover:bg-bg-hover"
                      )}
                    >
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Owner filter */}
            {availableOwners.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Owner
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableOwners.map((owner) => (
                    <button
                      key={owner}
                      onClick={() => toggleOwner(owner)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-md border text-sm transition-colors",
                        filters.owners.includes(owner)
                          ? "border-primary bg-primary/10"
                          : "border-border-subtle hover:bg-bg-hover"
                      )}
                    >
                      {owner}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Effort filter */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5" />
                Effort Estimate
              </h4>
              <div className="flex flex-wrap gap-2">
                {ALL_EFFORTS.map((effort) => (
                  <button
                    key={effort.value}
                    onClick={() => toggleEffort(effort.value)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md border text-sm transition-colors",
                      filters.efforts.includes(effort.value)
                        ? "border-primary bg-primary/10"
                        : "border-border-subtle hover:bg-bg-hover"
                    )}
                  >
                    {effort.label}
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
