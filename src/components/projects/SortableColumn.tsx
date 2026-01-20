"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskColumn } from "./TaskColumn";
import type { DbColumn, DbTask, DbLabel } from "@/types/database";

interface SortableColumnProps {
  column: DbColumn;
  tasks: DbTask[];
  taskLabels?: Record<string, DbLabel[]>;
  checklistProgress?: Record<string, { completed: number; total: number }>;
  onAddTask?: (columnId: string, title: string) => Promise<DbTask | void>;
  onTaskClick?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask) => void;
  onEditTask?: (task: DbTask) => void;
  onDeleteTask?: (task: DbTask) => void;
  onColumnUpdate?: () => void;
}

export function SortableColumn({
  column,
  tasks,
  taskLabels,
  checklistProgress,
  onAddTask,
  onTaskClick,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onColumnUpdate,
}: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskColumn
        column={column}
        tasks={tasks}
        taskLabels={taskLabels}
        checklistProgress={checklistProgress}
        onAddTask={onAddTask}
        onTaskClick={onTaskClick}
        onToggleTask={onToggleTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onColumnUpdate={onColumnUpdate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
