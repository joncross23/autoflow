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

  // Status filter
  if (filters.statuses.length > 0) {
    values.push({
      id: "status-filter",
      type: "status",
      value: filters.statuses,
      displayLabel:
        filters.statuses.length === 1
          ? filters.statuses[0]
          : `${filters.statuses.length} statuses`,
    });
  }

  // Horizon filter
  if (filters.horizons.length > 0) {
    const validHorizons = filters.horizons.filter((h) => h !== null);
    const hasUnplanned = filters.horizons.includes(null);
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

  // Label filter
  if (filters.labelIds.length > 0) {
    values.push({
      id: "label-filter",
      type: "label",
      value: filters.labelIds,
      displayLabel:
        filters.labelIds.length === 1
          ? "1 label"
          : `${filters.labelIds.length} labels`,
    });
  }

  // Owner filter
  if (filters.owners.length > 0) {
    values.push({
      id: "owner-filter",
      type: "owner",
      value: filters.owners,
      displayLabel:
        filters.owners.length === 1
          ? filters.owners[0]
          : `${filters.owners.length} owners`,
    });
  }

  // Effort filter
  if (filters.efforts.length > 0) {
    values.push({
      id: "effort-filter",
      type: "effort",
      value: filters.efforts,
      displayLabel:
        filters.efforts.length === 1
          ? filters.efforts[0]
          : `${filters.efforts.length} efforts`,
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
