"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { DbColumn, DbTask, DbLabel } from "@/types/database";

interface TaskColumnProps {
  column: DbColumn;
  tasks: DbTask[];
  taskLabels?: Record<string, DbLabel[]>;
  onAddTask?: (columnId: string) => void;
  onToggleTask?: (task: DbTask) => void;
  onEditTask?: (task: DbTask) => void;
  onDeleteTask?: (task: DbTask) => void;
}

const columnColorClasses: Record<string, { header: string; border: string }> = {
  slate: { header: "bg-slate-500/20 text-slate-300", border: "border-t-slate-500" },
  blue: { header: "bg-blue-500/20 text-blue-300", border: "border-t-blue-500" },
  green: { header: "bg-green-500/20 text-green-300", border: "border-t-green-500" },
  orange: { header: "bg-orange-500/20 text-orange-300", border: "border-t-orange-500" },
  purple: { header: "bg-purple-500/20 text-purple-300", border: "border-t-purple-500" },
  red: { header: "bg-red-500/20 text-red-300", border: "border-t-red-500" },
  yellow: { header: "bg-yellow-500/20 text-yellow-300", border: "border-t-yellow-500" },
  pink: { header: "bg-pink-500/20 text-pink-300", border: "border-t-pink-500" },
};

export function TaskColumn({
  column,
  tasks,
  taskLabels = {},
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const colorClass = columnColorClasses[column.color || "slate"] || columnColorClasses.slate;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      className={`
        flex flex-col w-72 min-w-72 rounded-lg bg-bg-secondary border-t-4
        ${colorClass.border}
        ${isOver ? "ring-2 ring-primary" : ""}
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass.header}`}>
            {column.name}
          </span>
          <span className="text-xs text-foreground-muted">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(column.id)}
          className="p-1 text-foreground-muted hover:text-foreground hover:bg-bg-tertiary rounded transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tasks */}
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              labels={taskLabels[task.id] || []}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-foreground-muted border-2 border-dashed border-border rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>

      {/* WIP limit indicator */}
      {column.wip_limit && tasks.length > column.wip_limit && (
        <div className="px-3 py-1 text-xs text-warning bg-warning/10 border-t border-warning/20">
          WIP limit exceeded ({tasks.length}/{column.wip_limit})
        </div>
      )}
    </div>
  );
}
