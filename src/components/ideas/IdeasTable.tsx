"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, GripVertical, Settings2, ChevronRight, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { IdeasTableRow } from "./IdeasTableRow";
import { StatusBadge } from "./StatusBadge";
import type { DbIdea, DbLabel, ColumnConfig, DEFAULT_IDEA_COLUMNS } from "@/types/database";
import type { IdeaTaskProgress } from "@/lib/api/ideas";

export type SortField =
  | "title"
  | "status"
  | "score"
  | "updated_at"
  | "created_at"
  | "horizon"
  | "rice_score"
  | "rice_reach"
  | "rice_impact"
  | "rice_confidence"
  | "rice_effort"
  | "effort_estimate"
  | "custom";
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
  onReorder?: (reorderedIdeas: DbIdea[]) => void;
  aiScores?: Record<string, number>;
  ideaLabels?: Record<string, DbLabel[]>;
  ideaProgress?: Record<string, IdeaTaskProgress>;
  loading?: boolean;
}

const COLUMN_LABELS: Record<string, string> = {
  title: "Title",
  category: "Category",
  status: "Status",
  labels: "Labels",
  score: "Score",
  horizon: "Horizon",
  rice_score: "RICE",
  progress: "Progress",
  updated_at: "Updated",
  created_at: "Created",
  description: "Description",
  effort_estimate: "Effort",
  owner: "Owner",
  started_at: "Started",
  completed_at: "Completed",
  themes: "Themes",
  rice_reach: "Reach",
  rice_impact: "Impact",
  rice_confidence: "Confidence",
  rice_effort: "Effort (RICE)",
};

// Sortable row wrapper for dnd-kit
function SortableRow({
  idea,
  columns,
  selected,
  onSelect,
  onClick,
  aiScore,
  labels,
  progress,
  isDragActive,
  rowNumber,
}: {
  idea: DbIdea;
  columns: ColumnConfig[];
  selected: boolean;
  onSelect: (id: string, selected: boolean, shiftKey?: boolean) => void;
  onClick: (idea: DbIdea) => void;
  aiScore?: number | null;
  labels: DbLabel[];
  progress?: IdeaTaskProgress;
  isDragActive: boolean;
  rowNumber: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(idea.id, !selected, e.shiftKey);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-pointer border-b border-white/[0.03] transition-colors",
        "hover:bg-bg-hover",
        selected && "bg-primary/5",
        isDragging && "bg-bg-hover shadow-lg"
      )}
      onClick={() => onClick(idea)}
    >
      {/* Drag handle + Row number + Checkbox cell */}
      <td className="w-20 px-1 py-3">
        <div className="flex items-center gap-1">
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
              "p-0.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors",
              isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground/50 w-5 text-right tabular-nums shrink-0">
            {rowNumber}
          </span>
          <input
            type="checkbox"
            checked={selected}
            onClick={handleCheckboxClick}
            onChange={() => {}}
            className="h-4 w-4 rounded border-border bg-bg-secondary text-primary focus:ring-primary focus:ring-offset-0"
          />
        </div>
      </td>

      {/* Data cells - delegate to IdeasTableRow's renderCell logic */}
      {visibleColumns.map((col) => (
        <IdeasTableRow
          key={col.id}
          idea={idea}
          columns={columns}
          selected={selected}
          onSelect={onSelect}
          onClick={onClick}
          aiScore={aiScore}
          labels={labels}
          progress={progress}
          renderCellOnly={col.id}
        />
      ))}
    </tr>
  );
}

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
  onReorder,
  aiScores = {},
  ideaLabels = {},
  ideaProgress = {},
  loading = false,
}: IdeasTableProps) {
  const isMobile = useIsMobile();
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const lastSelectedId = useRef<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Memoise visible columns to prevent recalculation on every render
  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  const ideaIds = useMemo(() => ideas.map((idea) => idea.id), [ideas]);

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

  const handleSelectOne = (id: string, selected: boolean, shiftKey?: boolean) => {
    const newSelection = new Set(selectedIds);

    // Shift-click range selection
    if (shiftKey && lastSelectedId.current && selected) {
      const lastIndex = ideas.findIndex((i) => i.id === lastSelectedId.current);
      const currentIndex = ideas.findIndex((i) => i.id === id);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);

        for (let i = start; i <= end; i++) {
          newSelection.add(ideas[i].id);
        }
      }
    } else if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }

    // Track last selected for shift-click
    if (selected) {
      lastSelectedId.current = id;
    }

    onSelectionChange(newSelection);
  };

  // Mobile long-press to start selection mode
  const handleMobileLongPress = (id: string) => {
    handleSelectOne(id, true);
  };

  const handleMobileTouchStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      handleMobileLongPress(id);
    }, 500);
  };

  const handleMobileTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      onSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "desc");
    }
  };

  // Handle drag end - reorder ideas and switch to custom sort
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragActive(false);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = ideas.findIndex((i) => i.id === active.id);
    const newIndex = ideas.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const reordered = [...ideas];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Switch to custom order sort
    if (sortField !== "custom") {
      onSort("custom", "asc");
    }

    // Notify parent with reordered ideas
    if (onReorder) {
      onReorder(reordered);
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
  const handleColumnDragStart = (columnId: string) => {
    setDragColumn(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent, targetColumnId: string) => {
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

  const handleColumnDragEnd = () => {
    setDragColumn(null);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary/70" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary/70" />
    );
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Custom order indicator for mobile */}
        {sortField === "custom" && (
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1">
              Custom order
              <button
                onClick={() => onSort("updated_at", "desc")}
                className="hover:text-primary/70"
                aria-label="Clear custom order"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
        {loading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 bg-bg-secondary rounded-lg border border-border animate-pulse">
              <div className="h-5 bg-bg-tertiary rounded w-3/4 mb-2" />
              <div className="h-4 bg-bg-tertiary rounded w-1/4" />
            </div>
          ))
        ) : ideas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No ideas found
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => setIsDragActive(true)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ideaIds} strategy={verticalListSortingStrategy}>
              {ideas.map((idea, index) => {
                const labels = ideaLabels[idea.id] || [];
                const isSelected = selectedIds.has(idea.id);
                return (
                  <MobileSortableCard
                    key={idea.id}
                    idea={idea}
                    labels={labels}
                    isSelected={isSelected}
                    onSelect={handleSelectOne}
                    onIdeaClick={onIdeaClick}
                    onMobileTouchStart={handleMobileTouchStart}
                    onMobileTouchEnd={handleMobileTouchEnd}
                    rowNumber={index + 1}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}

        {/* Selection info */}
        {selectedIds.size > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {selectedIds.size} idea{selectedIds.size !== 1 ? "s" : ""} selected
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative pt-10">
      {/* Column settings + custom order indicator */}
      <div className="absolute right-0 top-0 z-10 flex items-center gap-2">
        {sortField === "custom" && (
          <span className="text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1">
            Custom order
            <button
              onClick={() => onSort("updated_at", "desc")}
              className="hover:text-primary/70"
              aria-label="Clear custom order"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
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
      <div data-testid="ideas-table" className="overflow-x-auto rounded-lg border border-border bg-bg-secondary">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={() => setIsDragActive(true)}
          onDragEnd={handleDragEnd}
        >
          <table ref={tableRef} className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {/* Drag handle + Row number + Checkbox header */}
                <th className="w-20 px-1 py-3 text-left">
                  <div className="flex items-center gap-1">
                    <div className="w-5" /> {/* Spacer for drag handle alignment */}
                    <span className="text-[11px] text-muted-foreground/50 w-5 text-right">#</span>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-border bg-bg-secondary text-primary focus:ring-primary focus:ring-offset-0"
                    />
                  </div>
                </th>

                {/* Column headers */}
                {visibleColumns.map((col) => {
                  const isSortable = [
                    "title",
                    "status",
                    "score",
                    "updated_at",
                    "created_at",
                    "horizon",
                    "rice_score",
                    "rice_reach",
                    "rice_impact",
                    "rice_confidence",
                    "rice_effort",
                    "effort_estimate",
                  ].includes(col.id);

                  return (
                    <th
                      key={col.id}
                      className="relative text-left group"
                      style={{ width: col.width, minWidth: col.width }}
                      draggable
                      onDragStart={() => handleColumnDragStart(col.id)}
                      onDragOver={(e) => handleColumnDragOver(e, col.id)}
                      onDragEnd={handleColumnDragEnd}
                    >
                      <div
                        className={cn(
                          "relative flex items-center gap-1.5 px-3 py-3 text-[13px] font-normal text-muted-foreground/80",
                          isSortable && "cursor-pointer hover:text-foreground"
                        )}
                        onClick={() => isSortable && handleSort(col.id as SortField)}
                      >
                        <GripVertical className="absolute -left-1 h-3 w-3 opacity-0 group-hover:opacity-30 cursor-grab" />
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
            <SortableContext items={ideaIds} strategy={verticalListSortingStrategy}>
              <tbody>
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03] animate-pulse">
                      <td className="px-1 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-5" />
                          <div className="h-3 w-5 bg-bg-tertiary rounded" />
                          <div className="h-4 w-4 bg-bg-tertiary rounded" />
                        </div>
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
                  ideas.map((idea, index) => (
                    <SortableRow
                      key={idea.id}
                      idea={idea}
                      columns={columns}
                      selected={selectedIds.has(idea.id)}
                      onSelect={handleSelectOne}
                      onClick={onIdeaClick}
                      aiScore={aiScores[idea.id]}
                      labels={ideaLabels[idea.id] || []}
                      progress={ideaProgress[idea.id]}
                      isDragActive={isDragActive}
                      rowNumber={index + 1}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
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

// Mobile sortable card
function MobileSortableCard({
  idea,
  labels,
  isSelected,
  onSelect,
  onIdeaClick,
  onMobileTouchStart,
  onMobileTouchEnd,
  rowNumber,
}: {
  idea: DbIdea;
  labels: DbLabel[];
  isSelected: boolean;
  onSelect: (id: string, selected: boolean, shiftKey?: boolean) => void;
  onIdeaClick: (idea: DbIdea) => void;
  onMobileTouchStart: (id: string) => void;
  onMobileTouchEnd: () => void;
  rowNumber: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full text-left p-4 bg-bg-secondary rounded-lg border transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-bg-hover",
        isDragging && "shadow-lg"
      )}
      onTouchStart={() => onMobileTouchStart(idea.id)}
      onTouchEnd={onMobileTouchEnd}
      onTouchCancel={onMobileTouchEnd}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="p-0.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors shrink-0 mt-0.5 touch-none"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Row number */}
        <span className="text-xs text-muted-foreground/50 w-5 text-right tabular-nums shrink-0 mt-0.5">
          {rowNumber}
        </span>

        {/* Checkbox for selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(idea.id, e.target.checked);
          }}
          className="h-4 w-4 mt-0.5 rounded border-border bg-bg-secondary text-primary focus:ring-primary focus:ring-offset-0 shrink-0"
        />

        {/* Card content - clickable */}
        <button
          onClick={() => onIdeaClick(idea)}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className="font-medium text-foreground truncate mb-1">
            {idea.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={idea.status} size="sm" />
            {idea.rice_score !== null && idea.rice_score !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                RICE: {idea.rice_score}
              </span>
            )}
            {labels.slice(0, 2).map((label) => (
              <span
                key={label.id}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
            {labels.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{labels.length - 2}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Updated {formatRelativeTime(idea.updated_at)}
          </p>
        </button>

        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
      </div>
    </div>
  );
}
