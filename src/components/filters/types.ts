/**
 * Unified Filter System Types
 * Shared type definitions for the filter bar used across Tasks & Ideas pages
 */

import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

// ============================================
// FILTER TYPES
// ============================================

/** All available filter types across both contexts */
export type FilterType =
  // Shared filters
  | "label"
  | "priority"
  | "hasAttachment"
  | "createdAt"
  | "owner"
  // Tasks-specific
  | "linkedIdea"
  | "dueDate"
  | "column"
  | "completed"
  // Ideas-specific
  | "category"
  | "status"
  | "linkedTask"
  | "horizon"
  | "effort"
  | "archived"
  | "startedAt"
  | "completedAt"
  | "quadrant";

/** Context determines which filters are available */
export type FilterContext = "tasks" | "ideas";

/** Control type for rendering the appropriate UI */
export type FilterControlType =
  | "boolean"
  | "select"
  | "multiSelect"
  | "dateRange"
  | "entitySearch";

// ============================================
// FILTER VALUE
// ============================================

/** A single active filter */
export interface FilterValue {
  id: string;
  type: FilterType;
  value: string | string[] | boolean;
  displayLabel: string;
  color?: string;
}

// ============================================
// FILTER DEFINITION
// ============================================

/** Metadata for a filter type */
export interface FilterDefinition {
  type: FilterType;
  label: string;
  icon: ComponentType<LucideProps>;
  control: FilterControlType;
  chipColor: ChipColor;
  context: FilterContext | "both";
}

/** Option for select/multiSelect controls */
export interface FilterOption {
  value: string;
  label: string;
  color?: string;
  icon?: ComponentType<LucideProps>;
}

// ============================================
// CHIP COLOURS
// ============================================

export type ChipColor =
  | "amber"
  | "blue"
  | "teal"
  | "red"
  | "green"
  | "cyan"
  | "slate"
  | "pink";

export const CHIP_COLOR_CLASSES: Record<ChipColor, string> = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  teal: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  green: "bg-green-500/15 text-green-400 border-green-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  slate: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

// ============================================
// FILTER OPTIONS CONSTANTS
// ============================================

export const DUE_DATE_OPTIONS: FilterOption[] = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "no-date", label: "No Due Date" },
];

export const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "critical", label: "Critical", color: "#dc2626" },
  { value: "high", label: "High", color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "low", label: "Low", color: "#22c55e" },
];

export const STATUS_OPTIONS: FilterOption[] = [
  { value: "new", label: "New", color: "#6b7280" },
  { value: "evaluating", label: "Evaluating", color: "#3b82f6" },
  { value: "accepted", label: "Accepted", color: "#22c55e" },
  { value: "doing", label: "Doing", color: "#8b5cf6" },
  { value: "complete", label: "Complete", color: "#10b981" },
  { value: "parked", label: "Parked", color: "#f59e0b" },
  { value: "dropped", label: "Dropped", color: "#ef4444" },
];

export const HORIZON_OPTIONS: FilterOption[] = [
  { value: "now", label: "Now", color: "#22c55e" },
  { value: "next", label: "Next", color: "#3b82f6" },
  { value: "later", label: "Later", color: "#64748b" },
  { value: "unplanned", label: "Unplanned", color: "#6b7280" },
];

export const EFFORT_OPTIONS: FilterOption[] = [
  { value: "trivial", label: "Trivial" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
];

export const DATE_CREATED_OPTIONS: FilterOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "this-quarter", label: "This Quarter" },
];

export const STARTED_DATE_OPTIONS: FilterOption[] = [
  { value: "today", label: "Started Today" },
  { value: "this-week", label: "Started This Week" },
  { value: "this-month", label: "Started This Month" },
  { value: "not-started", label: "Not Started" },
];

export const COMPLETED_DATE_OPTIONS: FilterOption[] = [
  { value: "today", label: "Completed Today" },
  { value: "this-week", label: "Completed This Week" },
  { value: "this-month", label: "Completed This Month" },
  { value: "not-completed", label: "Not Completed" },
];

export const CATEGORY_OPTIONS: FilterOption[] = [
  { value: "innovation", label: "Innovation", color: "#a855f7" },
  { value: "optimisation", label: "Optimisation", color: "#3b82f6" },
  { value: "cost_reduction", label: "Cost Reduction", color: "#22c55e" },
  { value: "compliance", label: "Compliance", color: "#f97316" },
];

export const QUADRANT_OPTIONS: FilterOption[] = [
  { value: "topLeft", label: "Quick Wins", color: "#22c55e" },
  { value: "topRight", label: "Major Projects", color: "#3b82f6" },
  { value: "bottomLeft", label: "Fill-ins", color: "#eab308" },
  { value: "bottomRight", label: "Time Sinks", color: "#ef4444" },
];

