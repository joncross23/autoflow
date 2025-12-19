"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { DbColumn, DbTask, DbLabel } from "@/types/database";

interface TaskColumnProps {
  column: DbColumn;
  tasks: DbTask[];
  taskLabels?: Record<string, DbLabel[]>;
  checklistProgress?: Record<string, { completed: number; total: number }>;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask) => void;
  onEditTask?: (task: DbTask) => void;
  onDeleteTask?: (task: DbTask) => void;
}

// Mapping column colors to actual hex values
const columnColors: Record<string, string> = {
  slate: "#64748B",
  blue: "#3B82F6",
  green: "#22C55E",
  orange: "#F59E0B",
  purple: "#8B5CF6",
  red: "#EF4444",
  yellow: "#EAB308",
  pink: "#EC4899",
  indigo: "#6366F1",
  emerald: "#10B981",
  cyan: "#06B6D4",
};

export function TaskColumn({
  column,
  tasks,
  taskLabels = {},
  checklistProgress = {},
  onAddTask,
  onTaskClick,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const colorHex = columnColors[column.color || "slate"] || columnColors.slate;
  const isOverLimit = column.wip_limit && tasks.length >= column.wip_limit;

  return (
    <div
      data-column-id={column.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex flex-col w-[280px] min-w-[280px] max-h-[calc(100vh-200px)]
        bg-bg-secondary/50 rounded-xl
        transition-all duration-150 ease-out
        ${isOver ? "ring-2 ring-primary/50" : ""}
      `}
    >
      {/* Column Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border-subtle select-none"
      >
        {/* Colored indicator square */}
        <div
          className="w-3 h-3 rounded shrink-0"
          style={{ backgroundColor: colorHex }}
        />

        {/* Column title */}
        <span className="text-sm font-semibold text-foreground flex-1">
          {column.name}
        </span>

        {/* Task count / WIP limit */}
        <span className={`text-xs ${isOverLimit ? "text-error font-semibold" : "text-foreground-muted"}`}>
          {tasks.length}
          {column.wip_limit ? `/${column.wip_limit}` : ""}
        </span>

        {/* Menu button (shows on hover) */}
        <button
          className={`p-1 text-foreground-muted hover:text-foreground transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        data-cards-container={column.id}
        className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-[100px]"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, index) => (
            <div key={task.id} data-card-index={index}>
              <TaskCard
                task={task}
                labels={taskLabels[task.id] || []}
                checklistProgress={checklistProgress[task.id]}
                onClick={onTaskClick}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </div>
          ))}
        </SortableContext>

        {/* Empty state placeholder */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-16 text-sm text-foreground-muted border-2 border-dashed border-border rounded-[10px] opacity-60">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Quick Add Card Button */}
      <div className="p-2 pt-0">
        <button
          onClick={() => onAddTask?.(column.id)}
          className="
            flex items-center gap-2 w-full px-3 py-2.5
            text-foreground-muted text-[13px]
            border border-dashed border-border rounded-[10px]
            transition-all duration-150
            hover:border-primary hover:text-primary
          "
        >
          <Plus className="h-4 w-4" />
          Add card
        </button>
      </div>

      {/* WIP limit warning */}
      {column.wip_limit && tasks.length > column.wip_limit && (
        <div className="px-3 py-1.5 text-xs text-error bg-error/10 border-t border-error/20 rounded-b-xl">
          WIP limit exceeded ({tasks.length}/{column.wip_limit})
        </div>
      )}
    </div>
  );
}
