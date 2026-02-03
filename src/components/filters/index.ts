/**
 * Unified Filter System
 * Modern chip-based filter bar for Tasks & Ideas pages
 */

// Main component
export { UnifiedFilterBar } from "./UnifiedFilterBar";

// Sub-components
export { FilterChip } from "./FilterChip";
export { AddFilterMenu } from "./AddFilterMenu";
export { FilterDropdownPortal } from "./FilterDropdownPortal";

// Controls
export { MultiSelectControl } from "./controls/MultiSelectControl";
export { DateRangeControl } from "./controls/DateRangeControl";
export { EntitySearchControl } from "./controls/EntitySearchControl";

// Types
export type {
  FilterType,
  FilterContext,
  FilterControlType,
  FilterValue,
  FilterDefinition,
  FilterOption,
  ChipColor,
} from "./types";

// Constants
export {
  CHIP_COLOR_CLASSES,
  DUE_DATE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  HORIZON_OPTIONS,
  EFFORT_OPTIONS,
  DATE_CREATED_OPTIONS,
  STARTED_DATE_OPTIONS,
  COMPLETED_DATE_OPTIONS,
  QUADRANT_OPTIONS,
} from "./types";

// Definitions
export { FILTER_DEFINITIONS, getFiltersForContext, getFilterDefinition } from "./definitions";

// Conversion utilities
export { ideaFiltersToValues, valuesToIdeaFilters } from "./useFilterConversion";
