"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableColumn } from "./SortableColumn";
import { CreateColumnButton } from "./CreateColumnButton";
import { TaskCard } from "./TaskCard";
import { updateTask } from "@/lib/api/tasks";
import { reorderGlobalColumns } from "@/lib/api/columns";
import type { DbColumn, DbTask, DbLabel } from "@/types/database";

interface TaskKanbanBoardProps {
  columns: DbColumn[];
  tasks: DbTask[];
  taskLabels?: Record<string, DbLabel[]>;
  checklistProgress?: Record<string, { completed: number; total: number }>;
  onTasksChange: (tasks: DbTask[]) => void;
  onAddTask?: (columnId: string, title: string) => Promise<DbTask | void>;
  onTaskClick?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask) => void;
  onEditTask?: (task: DbTask) => void;
  onDeleteTask?: (task: DbTask) => void;
  onColumnUpdate?: () => void;
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
  onColumnUpdate,
}: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<DbTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<DbColumn | null>(null);
  const [localColumns, setLocalColumns] = useState<DbColumn[]>(columns);

  // Sync localColumns with columns prop
  useMemo(() => {
    setLocalColumns(columns);
  }, [columns]);

  // Configure sensors for optimal touch and mouse behaviour
  // - PointerSensor: for mouse with small distance threshold
  // - TouchSensor: for touch with delay (allows taps without triggering drag)
  // - KeyboardSensor: for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10  // 10px movement before drag starts (mouse, three-finger drag compatible)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,    // 250ms delay before drag starts (touch)
        tolerance: 5,  // 5px movement tolerance during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper: resolve an overId to a column ID
  // The droppable inside TaskColumn uses `droppable-${column.id}`,
  // while the SortableColumn wrapper uses the raw `column.id`.
  const resolveColumnId = useCallback(
    (id: string): string | null => {
      if (columns.some((col) => col.id === id)) return id;
      if (id.startsWith("droppable-")) {
        const stripped = id.slice("droppable-".length);
        if (columns.some((col) => col.id === stripped)) return stripped;
      }
      return null;
    },
    [columns]
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

      // Check if dragging a column or task
      const column = localColumns.find((c) => c.id === active.id);
      if (column) {
        setActiveColumn(column);
        return;
      }

      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks, localColumns]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Skip if dragging a column - SortableContext handles column reordering
      const isColumnDrag = localColumns.some((c) => c.id === activeId);
      if (isColumnDrag) {
        return;
      }

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      // Check if dropping on a column (raw ID or droppable-prefixed ID)
      const overColumnId = resolveColumnId(overId);
      if (overColumnId) {
        const newColumnId = overColumnId;
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
        } else if (activeTask.column_id) {
          // Reorder within same column - use column-specific indices
          const columnTasks = tasksByColumn[activeTask.column_id] || [];
          const activeColumnIndex = columnTasks.findIndex((t: DbTask) => t.id === activeId);
          const overColumnIndex = columnTasks.findIndex((t: DbTask) => t.id === overId);

          if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
            // Reorder within the column array
            const reorderedColumn = arrayMove(columnTasks, activeColumnIndex, overColumnIndex);

            // Rebuild full tasks array with updated positions
            const updatedTasks = tasks.map((t) => {
              if (t.column_id !== activeTask.column_id) return t;
              const newPos = reorderedColumn.findIndex((ct: DbTask) => ct.id === t.id);
              return newPos !== -1 ? { ...t, position: newPos } : t;
            });

            onTasksChange(updatedTasks);
          }
        }
      }
    },
    [tasks, columns, tasksByColumn, onTasksChange, resolveColumnId, localColumns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      setActiveColumn(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if dragging a column
      const activeColumnIndex = localColumns.findIndex((c) => c.id === activeId);
      if (activeColumnIndex !== -1) {
        const overColumnIndex = localColumns.findIndex((c) => c.id === overId);
        if (overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
          // Reorder columns
          const newColumns = arrayMove(localColumns, activeColumnIndex, overColumnIndex);
          setLocalColumns(newColumns);

          // Save new order to database
          try {
            await reorderGlobalColumns(newColumns.map((c) => c.id));
            onColumnUpdate?.();
          } catch (error) {
            console.error("Failed to reorder columns:", error);
            // Revert on error
            setLocalColumns(localColumns);
          }
        }
        return;
      }

      // Find the task in current state (which has updated column_id from handleDragOver)
      const task = tasks.find((t) => t.id === activeId);
      if (!task) return;

      // Determine target column - either the column we're over, or the column of the task we're over
      let targetColumnId = task.column_id;
      const overColumnId = resolveColumnId(overId);
      if (overColumnId) {
        targetColumnId = overColumnId;
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
    [tasks, columns, localColumns, onColumnUpdate, resolveColumnId]
  );

  // Sort columns by position
  const sortedColumns = useMemo(
    () => [...localColumns].sort((a, b) => a.position - b.position),
    [localColumns]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedColumns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory sm:snap-none scroll-smooth px-4 sm:px-0 -mx-4 sm:mx-0">
          {sortedColumns.map((column) => (
            <SortableColumn
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
              onColumnUpdate={onColumnUpdate}
            />
          ))}

          {/* Create Column Button */}
          <CreateColumnButton onColumnCreated={() => onColumnUpdate?.()} />
        </div>
      </SortableContext>

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
        {activeColumn && (
          <div className="opacity-80 rotate-1">
            <SortableColumn
              column={activeColumn}
              tasks={tasksByColumn[activeColumn.id] || []}
              taskLabels={taskLabels}
              checklistProgress={checklistProgress}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
