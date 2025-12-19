"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, GripVertical, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdeasTableRow } from "./IdeasTableRow";
import type { DbIdea, ColumnConfig, DEFAULT_IDEA_COLUMNS } from "@/types/database";

export type SortField = "title" | "status" | "score" | "updated_at" | "created_at";
export type SortOrder = "asc" | "desc";

interface IdeasTableProps {
  ideas: DbIdea[];
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onIdeaClick: (idea: DbIdea) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
  aiScores?: Record<string, number>;
  loading?: boolean;
}

const COLUMN_LABELS: Record<string, string> = {
  title: "Title",
  status: "Status",
  score: "Score",
  updated_at: "Updated",
  created_at: "Created",
  description: "Description",
  effort_estimate: "Effort",
  owner: "Owner",
  started_at: "Started",
  completed_at: "Completed",
  themes: "Themes",
};

export function IdeasTable({
  ideas,
  columns,
  onColumnsChange,
  selectedIds,
  onSelectionChange,
  onIdeaClick,
  sortField,
  sortOrder,
  onSort,
  aiScores = {},
  loading = false,
}: IdeasTableProps) {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  // Handle select all
  const allSelected = ideas.length > 0 && ideas.every((idea) => selectedIds.has(idea.id));
  const someSelected = ideas.some((idea) => selectedIds.has(idea.id));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(ideas.map((idea) => idea.id)));
    }
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedIds);
    if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  };

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      onSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "desc");
    }
  };

  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    const col = columns.find((c) => c.id === columnId);
    resizeStartWidth.current = col?.width || 100;
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(60, resizeStartWidth.current + diff);

      onColumnsChange(
        columns.map((col) =>
          col.id === resizingColumn ? { ...col, width: newWidth } : col
        )
      );
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, columns, onColumnsChange]);

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    onColumnsChange(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Handle column drag reorder
  const handleDragStart = (columnId: string) => {
    setDragColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!dragColumn || dragColumn === targetColumnId) return;

    const dragIdx = columns.findIndex((c) => c.id === dragColumn);
    const targetIdx = columns.findIndex((c) => c.id === targetColumnId);

    if (dragIdx === -1 || targetIdx === -1) return;

    // Reorder columns
    const newColumns = [...columns];
    const dragOrder = newColumns[dragIdx].order;
    const targetOrder = newColumns[targetIdx].order;

    newColumns[dragIdx] = { ...newColumns[dragIdx], order: targetOrder };
    newColumns[targetIdx] = { ...newColumns[targetIdx], order: dragOrder };

    onColumnsChange(newColumns);
  };

  const handleDragEnd = () => {
    setDragColumn(null);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className="relative">
      {/* Column settings dropdown */}
      <div className="absolute right-0 -top-10 z-10">
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-hover rounded-md transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          Columns
        </button>

        {showColumnSettings && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowColumnSettings(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-2">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                Toggle Columns
              </div>
              {columns.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-bg-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumnVisibility(col.id)}
                    className="h-4 w-4 rounded border-border bg-bg-secondary text-primary"
                    disabled={col.id === "title"} // Title always visible
                  />
                  <span className="text-sm">{COLUMN_LABELS[col.id]}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table ref={tableRef} className="w-full border-collapse">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              {/* Checkbox header */}
              <th className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-border bg-bg-secondary text-primary focus:ring-primary focus:ring-offset-0"
                />
              </th>

              {/* Column headers */}
              {visibleColumns.map((col) => {
                const isSortable = ["title", "status", "score", "updated_at", "created_at"].includes(
                  col.id
                );

                return (
                  <th
                    key={col.id}
                    className="relative text-left group"
                    style={{ width: col.width, minWidth: col.width }}
                    draggable
                    onDragStart={() => handleDragStart(col.id)}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide",
                        isSortable && "cursor-pointer hover:text-foreground"
                      )}
                      onClick={() => isSortable && handleSort(col.id as SortField)}
                    >
                      <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 cursor-grab mr-1" />
                      {COLUMN_LABELS[col.id]}
                      {isSortable && renderSortIcon(col.id as SortField)}
                    </div>

                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, col.id)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle animate-pulse">
                  <td className="px-3 py-3">
                    <div className="h-4 w-4 bg-bg-tertiary rounded" />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.id} className="px-3 py-3">
                      <div
                        className="h-4 bg-bg-tertiary rounded"
                        style={{ width: `${Math.random() * 40 + 40}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : ideas.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="px-3 py-12 text-center text-muted-foreground"
                >
                  No ideas found
                </td>
              </tr>
            ) : (
              ideas.map((idea) => (
                <IdeasTableRow
                  key={idea.id}
                  idea={idea}
                  columns={columns}
                  selected={selectedIds.has(idea.id)}
                  onSelect={handleSelectOne}
                  onClick={onIdeaClick}
                  aiScore={aiScores[idea.id]}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {selectedIds.size} idea{selectedIds.size !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
