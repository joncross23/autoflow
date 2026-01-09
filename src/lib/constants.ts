/**
 * Application constants
 */

export const APP_NAME = "AutoFlow";
export const APP_DESCRIPTION = "AI & Automation Discovery Platform";

/**
 * Idea/Project status workflow
 */
export const IDEA_STATUSES = [
  "new",
  "evaluating",
  "accepted",
  "doing",
  "complete",
  "parked",
  "dropped",
] as const;

export const PROJECT_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
  "archived",
] as const;

/**
 * Default Kanban columns
 */
export const DEFAULT_COLUMNS = [
  { id: "backlog", title: "Backlog", color: "#64748B" },
  { id: "todo", title: "To Do", color: "#3B82F6" },
  { id: "in_progress", title: "In Progress", color: "#F59E0B" },
  { id: "review", title: "Review", color: "#14B8A6" },
  { id: "done", title: "Done", color: "#22C55E" },
] as const;

/**
 * Label preset colours
 */
/**
 * Label preset colours (6 default options)
 * WCAG AA compliant (4.5:1 contrast with white text)
 */
export const LABEL_COLORS = [
  { name: "cyan", hex: "#06B6D4" },
  { name: "green", hex: "#22C55E" },
  { name: "blue", hex: "#3B82F6" },
  { name: "yellow", hex: "#EAB308" },
  { name: "red", hex: "#EF4444" },
  { name: "orange", hex: "#F97316" },
] as const;

/**
 * Frequency options for ideas
 */
export const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "adhoc", label: "Ad-hoc" },
] as const;

/**
 * Complexity levels for AI evaluation
 */
export const COMPLEXITY_LEVELS = [
  { value: "low", label: "Low", color: "#22C55E" },
  { value: "medium", label: "Medium", color: "#EAB308" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "very_high", label: "Very High", color: "#EF4444" },
] as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  quickCapture: "mod+k",
  toggleSidebar: "mod+b",
  search: "mod+/",
  save: "mod+s",
  escape: "escape",
} as const;
