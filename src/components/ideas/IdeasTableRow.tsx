"use client";

import { memo } from "react";
import { cn, formatRelativeTime, formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ScoreBadge } from "./ScoreBadge";
import type { DbIdea, DbLabel, ColumnConfig, EffortEstimate, PlanningHorizon, IdeaCategory } from "@/types/database";
import { IDEA_CATEGORY_OPTIONS } from "@/types/database";
import type { IdeaTaskProgress } from "@/lib/api/ideas";

const CATEGORY_COLORS: Record<IdeaCategory, string> = {
  innovation: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  optimisation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  cost_reduction: "bg-green-500/10 text-green-500 border-green-500/20",
  compliance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const HORIZON_COLORS: Record<NonNullable<PlanningHorizon>, string> = {
  now: "bg-green-500/10 text-green-500 border-green-500/20",
  next: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  later: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

interface IdeasTableRowProps {
  idea: DbIdea;
  columns: ColumnConfig[];
  selected: boolean;
  onSelect: (id: string, selected: boolean, shiftKey?: boolean) => void;
  onClick: (idea: DbIdea) => void;
  aiScore?: number | null;
  labels?: DbLabel[];
  progress?: IdeaTaskProgress;
  /** When set, renders only the specified cell's <td> (no <tr> wrapper, no checkbox). Used by SortableRow. */
  renderCellOnly?: string;
}

const EFFORT_LABELS: Record<EffortEstimate, string> = {
  trivial: "Trivial",
  small: "Small",
  medium: "Medium",
  large: "Large",
  xlarge: "X-Large",
};

function IdeasTableRowComponent({
  idea,
  columns,
  selected,
  onSelect,
  onClick,
  aiScore,
  labels = [],
  progress,
  renderCellOnly,
}: IdeasTableRowProps) {
  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(idea.id, !selected, e.shiftKey);
  };

  const handleRowClick = () => {
    onClick(idea);
  };

  const renderCell = (columnId: string, width: number) => {
    const cellClass = "px-3 py-3 truncate";
    const style = { width, minWidth: width, maxWidth: width };

    switch (columnId) {
      case "title":
        return (
          <td key={columnId} className={cn(cellClass, "font-medium")} style={style}>
            {idea.title}
          </td>
        );
      case "status":
        return (
          <td key={columnId} className={cellClass} style={style}>
            <StatusBadge status={idea.status} size="sm" />
          </td>
        );
      case "category":
        return (
          <td key={columnId} className={cellClass} style={style}>
            {idea.category ? (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium border",
                  CATEGORY_COLORS[idea.category]
                )}
              >
                {IDEA_CATEGORY_OPTIONS.find((o) => o.value === idea.category)?.label ?? idea.category}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </td>
        );
      case "horizon":
        return (
          <td key={columnId} className={cellClass} style={style}>
            {idea.horizon ? (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium border",
                  HORIZON_COLORS[idea.horizon]
                )}
              >
                {idea.horizon.charAt(0).toUpperCase() + idea.horizon.slice(1)}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </td>
        );
      case "score":
      case "rice_score":
        return (
          <td key={columnId} className={cellClass} style={style}>
            <ScoreBadge score={idea.rice_score ?? aiScore ?? null} size="sm" />
          </td>
        );
      case "updated_at":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-muted-foreground text-sm")}
            style={style}
          >
            {formatRelativeTime(idea.updated_at)}
          </td>
        );
      case "created_at":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-muted-foreground text-sm")}
            style={style}
          >
            {formatDate(idea.created_at)}
          </td>
        );
      case "description":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-muted-foreground text-sm")}
            style={style}
            title={idea.description || undefined}
          >
            {idea.description || "-"}
          </td>
        );
      case "effort_estimate":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-sm")}
            style={style}
          >
            {idea.effort_estimate ? EFFORT_LABELS[idea.effort_estimate] : "-"}
          </td>
        );
      case "owner":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-sm")}
            style={style}
          >
            {idea.owner || "-"}
          </td>
        );
      case "started_at":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-muted-foreground text-sm")}
            style={style}
          >
            {idea.started_at ? formatDate(idea.started_at) : "-"}
          </td>
        );
      case "completed_at":
        return (
          <td
            key={columnId}
            className={cn(cellClass, "text-muted-foreground text-sm")}
            style={style}
          >
            {idea.completed_at ? formatDate(idea.completed_at) : "-"}
          </td>
        );
      case "themes":
        return (
          <td key={columnId} className={cellClass} style={style}>
            {/* Themes will be populated when we add theme fetching */}
            <span className="text-muted-foreground text-sm">-</span>
          </td>
        );
      case "labels":
        return (
          <td key={columnId} className={cellClass} style={style}>
            {labels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {labels.slice(0, 3).map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {labels.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{labels.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </td>
        );
      case "rice_reach":
        return (
          <td key={columnId} className={cn(cellClass, "text-sm")} style={style}>
            {idea.rice_reach ?? "-"}
          </td>
        );
      case "rice_impact":
        return (
          <td key={columnId} className={cn(cellClass, "text-sm")} style={style}>
            {idea.rice_impact ?? "-"}
          </td>
        );
      case "rice_confidence":
        return (
          <td key={columnId} className={cn(cellClass, "text-sm")} style={style}>
            {idea.rice_confidence ? `${idea.rice_confidence}%` : "-"}
          </td>
        );
      case "rice_effort":
        return (
          <td key={columnId} className={cn(cellClass, "text-sm")} style={style}>
            {idea.rice_effort ?? "-"}
          </td>
        );
      case "progress":
        // Hide/empty cell when no tasks (per user requirement)
        if (!progress || progress.totalTasks === 0) {
          return (
            <td key={columnId} className={cellClass} style={style}>
              <span className="text-muted-foreground text-sm">-</span>
            </td>
          );
        }
        return (
          <td key={columnId} className={cellClass} style={style}>
            <div className="flex items-center gap-2">
              {/* Progress bar */}
              <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden min-w-[40px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progress.percentage === 100 ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              {/* Count */}
              <span className="text-xs text-muted-foreground shrink-0">
                {progress.completedTasks}/{progress.totalTasks}
              </span>
              {/* Check mark for complete */}
              {progress.percentage === 100 && (
                <span className="text-green-500 text-xs">✓</span>
              )}
            </div>
          </td>
        );
      default:
        return (
          <td key={columnId} className={cellClass} style={style}>
            -
          </td>
        );
    }
  };

  // When renderCellOnly is set, just return the single cell <td> (used by SortableRow)
  if (renderCellOnly) {
    const col = visibleColumns.find((c) => c.id === renderCellOnly);
    if (!col) return null;
    return renderCell(col.id, col.width);
  }

  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-white/[0.03] transition-colors",
        "hover:bg-bg-hover",
        selected && "bg-primary/5"
      )}
      onClick={handleRowClick}
    >
      {/* Checkbox cell */}
      <td className="w-12 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onClick={handleCheckboxClick}
          onChange={() => {}}
          className="h-4 w-4 rounded border-border bg-bg-secondary text-primary focus:ring-primary focus:ring-offset-0"
        />
      </td>

      {/* Data cells */}
      {visibleColumns.map((col) => renderCell(col.id, col.width))}
    </tr>
  );
}

export const IdeasTableRow = memo(IdeasTableRowComponent);
