"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { updateTask } from "@/lib/api/tasks";
import type { DbColumn, DbTask, DbLabel } from "@/types/database";

interface TaskKanbanBoardProps {
  columns: DbColumn[];
  tasks: DbTask[];
  taskLabels?: Record<string, DbLabel[]>;
  checklistProgress?: Record<string, { completed: number; total: number }>;
  onTasksChange: (tasks: DbTask[]) => void;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask) => void;
  onEditTask?: (task: DbTask) => void;
  onDeleteTask?: (task: DbTask) => void;
}

export function TaskKanbanBoard({
  columns,
  tasks,
  taskLabels = {},
  checklistProgress = {},
  onTasksChange,
  onAddTask,
  onTaskClick,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<DbTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, DbTask[]> = {};

    // Initialize empty arrays for each column
    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    // Add tasks to their columns
    tasks.forEach((task) => {
      if (task.column_id && grouped[task.column_id]) {
        grouped[task.column_id].push(task);
      }
    });

    // Sort each column by position
    Object.keys(grouped).forEach((columnId) => {
      grouped[columnId].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [columns, tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      // Check if dropping on a column
      const isOverColumn = columns.some((col) => col.id === overId);
      if (isOverColumn) {
        const newColumnId = overId;
        if (activeTask.column_id !== newColumnId) {
          // Move to new column at end
          const updatedTasks = tasks.map((t) =>
            t.id === activeId
              ? {
                  ...t,
                  column_id: newColumnId,
                  position: tasksByColumn[newColumnId]?.length || 0,
                }
              : t
          );
          onTasksChange(updatedTasks);
        }
        return;
      }

      // Check if dropping on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.id !== overTask.id) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeTask.column_id !== overTask.column_id) {
          // Moving to different column
          const updatedTasks = tasks.map((t) =>
            t.id === activeId
              ? { ...t, column_id: overTask.column_id, position: overTask.position }
              : t
          );
          onTasksChange(updatedTasks);
        } else {
          // Reorder within same column
          const reordered = arrayMove(tasks, activeIndex, overIndex);
          onTasksChange(reordered);
        }
      }
    },
    [tasks, columns, tasksByColumn, onTasksChange]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find the task in current state (which has updated column_id from handleDragOver)
      const task = tasks.find((t) => t.id === activeId);
      if (!task) return;

      // Determine target column - either the column we're over, or the column of the task we're over
      let targetColumnId = task.column_id;
      const isOverColumn = columns.some((col) => col.id === overId);
      if (isOverColumn) {
        targetColumnId = overId;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          targetColumnId = overTask.column_id;
        }
      }

      // Calculate new position based on current tasks array order
      const tasksInTargetColumn = tasks.filter((t) => t.column_id === targetColumnId);
      const newPosition = tasksInTargetColumn.findIndex((t) => t.id === task.id);

      // Update in database
      try {
        await updateTask(task.id, {
          column_id: targetColumnId,
          position: newPosition >= 0 ? newPosition : 0,
        });
      } catch (error) {
        console.error("Failed to save task position:", error);
      }
    },
    [tasks, columns]
  );

  // Sort columns by position
  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {sortedColumns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            taskLabels={taskLabels}
            checklistProgress={checklistProgress}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onToggleTask={onToggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              labels={taskLabels[activeTask.id] || []}
              checklistProgress={checklistProgress[activeTask.id]}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
