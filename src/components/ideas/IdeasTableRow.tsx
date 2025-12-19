"use client";

import { memo } from "react";
import { cn, formatRelativeTime, formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ScoreBadge } from "./ScoreBadge";
import type { DbIdea, ColumnConfig, EffortEstimate } from "@/types/database";

interface IdeasTableRowProps {
  idea: DbIdea;
  columns: ColumnConfig[];
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onClick: (idea: DbIdea) => void;
  aiScore?: number | null;
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
}: IdeasTableRowProps) {
  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(idea.id, !selected);
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
      case "score":
        return (
          <td key={columnId} className={cellClass} style={style}>
            <ScoreBadge score={aiScore ?? null} size="sm" />
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
      default:
        return (
          <td key={columnId} className={cellClass} style={style}>
            -
          </td>
        );
    }
  };

  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-border-subtle transition-colors",
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
