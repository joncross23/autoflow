/**
 * Filter Conversion Utilities
 * Helpers to convert between IdeaFilters and FilterValue[] formats
 */

import type { FilterValue } from "./types";
import type { IdeaFilters } from "@/components/ideas";

/**
 * Convert IdeaFilters to FilterValue[] for UnifiedFilterBar
 */
export function ideaFiltersToValues(filters: IdeaFilters): FilterValue[] {
  const values: FilterValue[] = [];

  // Defensive checks for old saved views
  const statuses = filters.statuses ?? [];
  const horizons = filters.horizons ?? [];
  const categories = filters.categories ?? [];
  const labelIds = filters.labelIds ?? [];
  const owners = filters.owners ?? [];
  const efforts = filters.efforts ?? [];

  // Status filter
  if (statuses.length > 0) {
    values.push({
      id: "status-filter",
      type: "status",
      value: statuses,
      displayLabel:
        statuses.length === 1
          ? statuses[0]
          : `${statuses.length} statuses`,
    });
  }

  // Horizon filter
  if (horizons.length > 0) {
    const validHorizons = horizons.filter((h) => h !== null);
    const hasUnplanned = horizons.includes(null);
    const horizonValues = [
      ...validHorizons,
      ...(hasUnplanned ? ["unplanned"] : []),
    ];

    if (horizonValues.length > 0) {
      values.push({
        id: "horizon-filter",
        type: "horizon",
        value: horizonValues as string[],
        displayLabel:
          horizonValues.length === 1
            ? String(horizonValues[0])
            : `${horizonValues.length} horizons`,
      });
    }
  }

  // Category filter
  if (categories.length > 0) {
    values.push({
      id: "category-filter",
      type: "category",
      value: categories,
      displayLabel:
        categories.length === 1
          ? categories[0]
          : `${categories.length} categories`,
    });
  }

  // Label filter
  if (labelIds.length > 0) {
    values.push({
      id: "label-filter",
      type: "label",
      value: labelIds,
      displayLabel:
        labelIds.length === 1
          ? "1 label"
          : `${labelIds.length} labels`,
    });
  }

  // Owner filter
  if (owners.length > 0) {
    values.push({
      id: "owner-filter",
      type: "owner",
      value: owners,
      displayLabel:
        owners.length === 1
          ? owners[0]
          : `${owners.length} owners`,
    });
  }

  // Effort filter
  if (efforts.length > 0) {
    values.push({
      id: "effort-filter",
      type: "effort",
      value: efforts,
      displayLabel:
        efforts.length === 1
          ? efforts[0]
          : `${efforts.length} efforts`,
    });
  }

  // Archived filter
  if (filters.archived) {
    values.push({
      id: "archived-filter",
      type: "archived",
      value: true,
      displayLabel: "Archived",
    });
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange !== "all") {
    values.push({
      id: "createdAt-filter",
      type: "createdAt",
      value: [filters.dateRange],
      displayLabel: getDateRangeLabel(filters.dateRange),
    });
  }

  return values;
}

/**
 * Convert FilterValue[] to IdeaFilters format
 */
export function valuesToIdeaFilters(
  values: FilterValue[],
  currentSearch: string = ""
): IdeaFilters {
  const filters: IdeaFilters = {
    statuses: [],
    horizons: [],
    categories: [],
    labelIds: [],
    owners: [],
    efforts: [],
    archived: false,
    dateRange: "all",
    search: currentSearch,
  };

  for (const filter of values) {
    const filterValues = Array.isArray(filter.value)
      ? filter.value
      : [filter.value];

    switch (filter.type) {
      case "status":
        filters.statuses = filterValues as IdeaFilters["statuses"];
        break;

      case "horizon":
        filters.horizons = filterValues.map((v) =>
          v === "unplanned" ? null : v
        ) as IdeaFilters["horizons"];
        break;

      case "category":
        filters.categories = filterValues as IdeaFilters["categories"];
        break;

      case "label":
        filters.labelIds = filterValues as string[];
        break;

      case "owner":
        filters.owners = filterValues as string[];
        break;

      case "effort":
        filters.efforts = filterValues as IdeaFilters["efforts"];
        break;

      case "archived":
        filters.archived = filter.value === true;
        break;

      case "createdAt":
        // Normalize "this-week" → "week" for IdeaFilters compatibility
        const rawValue = filterValues[0] as string;
        const normalized = rawValue?.replace("this-", "") || "all";
        filters.dateRange = normalized as IdeaFilters["dateRange"];
        break;
    }
  }

  return filters;
}

function getDateRangeLabel(range: string): string {
  switch (range) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "week":
    case "this-week":
      return "This Week";
    case "month":
    case "this-month":
      return "This Month";
    case "quarter":
    case "this-quarter":
      return "This Quarter";
    default:
      return "All Time";
  }
}
