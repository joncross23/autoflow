/**
 * Filter Definitions
 * Metadata for each filter type including label, icon, control type, and context
 */

import {
  Tag,
  AlertCircle,
  Paperclip,
  Calendar,
  User,
  Lightbulb,
  Columns3,
  CheckCircle,
  CheckCircle2,
  PlayCircle,
  Clock,
  Gauge,
  Archive,
  ListTodo,
  Grid2x2,
} from "lucide-react";
import type { FilterDefinition, FilterContext } from "./types";

/** All filter definitions */
export const FILTER_DEFINITIONS: FilterDefinition[] = [
  // Shared filters
  {
    type: "label",
    label: "Label",
    icon: Tag,
    control: "multiSelect",
    chipColor: "blue",
    context: "both",
  },
  {
    type: "priority",
    label: "Priority",
    icon: AlertCircle,
    control: "multiSelect",
    chipColor: "red",
    context: "tasks",
  },
  {
    type: "hasAttachment",
    label: "Has Attachment",
    icon: Paperclip,
    control: "boolean",
    chipColor: "blue",
    context: "tasks",
  },
  {
    type: "createdAt",
    label: "Date Created",
    icon: Calendar,
    control: "dateRange",
    chipColor: "purple",
    context: "both",
  },
  {
    type: "owner",
    label: "Owner",
    icon: User,
    control: "entitySearch",
    chipColor: "slate",
    context: "both",
  },

  // Tasks-specific filters
  {
    type: "linkedIdea",
    label: "Linked Idea",
    icon: Lightbulb,
    control: "entitySearch",
    chipColor: "amber",
    context: "tasks",
  },
  {
    type: "dueDate",
    label: "Due Date",
    icon: Calendar,
    control: "dateRange",
    chipColor: "purple",
    context: "tasks",
  },
  {
    type: "column",
    label: "Column",
    icon: Columns3,
    control: "multiSelect",
    chipColor: "slate",
    context: "tasks",
  },
  {
    type: "completed",
    label: "Completed",
    icon: CheckCircle,
    control: "boolean",
    chipColor: "green",
    context: "tasks",
  },

  // Ideas-specific filters
  {
    type: "status",
    label: "Status",
    icon: CheckCircle,
    control: "multiSelect",
    chipColor: "green",
    context: "ideas",
  },
  {
    type: "linkedTask",
    label: "Linked Tasks",
    icon: ListTodo,
    control: "entitySearch",
    chipColor: "cyan",
    context: "ideas",
  },
  {
    type: "horizon",
    label: "Planning Horizon",
    icon: Clock,
    control: "multiSelect",
    chipColor: "blue",
    context: "ideas",
  },
  {
    type: "effort",
    label: "Effort Estimate",
    icon: Gauge,
    control: "multiSelect",
    chipColor: "slate",
    context: "ideas",
  },
  {
    type: "archived",
    label: "Archived",
    icon: Archive,
    control: "boolean",
    chipColor: "slate",
    context: "ideas",
  },
  {
    type: "startedAt",
    label: "Started Date",
    icon: PlayCircle,
    control: "dateRange",
    chipColor: "green",
    context: "ideas",
  },
  {
    type: "completedAt",
    label: "Completed Date",
    icon: CheckCircle2,
    control: "dateRange",
    chipColor: "green",
    context: "ideas",
  },
  {
    type: "quadrant",
    label: "Matrix Quadrant",
    icon: Grid2x2,
    control: "multiSelect",
    chipColor: "green",
    context: "ideas",
  },
];

/** Get filter definitions for a specific context */
export function getFiltersForContext(context: FilterContext): FilterDefinition[] {
  return FILTER_DEFINITIONS.filter(
    (def) => def.context === context || def.context === "both"
  );
}

/** Get a single filter definition by type */
export function getFilterDefinition(type: string): FilterDefinition | undefined {
  return FILTER_DEFINITIONS.find((def) => def.type === type);
}
