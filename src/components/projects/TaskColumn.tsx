"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
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
  onAddTask?: (columnId: string, title: string) => Promise<DbTask | void>;
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
  purple: "#14B8A6",
  teal: "#14B8A6",
  red: "#EF4444",
  yellow: "#EAB308",
  pink: "#EC4899",
  indigo: "#14B8A6",
  emerald: "#10B981",
  cyan: "#06B6D4",
};

function TaskColumnComponent({
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
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Auto-focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const cancelAdding = useCallback(() => {
    setIsAdding(false);
    setNewCardTitle("");
  }, []);

  // Click outside to cancel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        cancelAdding();
      }
    };

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAdding, cancelAdding]);

  const handleSaveCard = useCallback(async (openAfterSave: boolean = false) => {
    const title = newCardTitle.trim();
    if (!title || !onAddTask || isSaving) return;

    setIsSaving(true);
    try {
      const newTask = await onAddTask(column.id, title);
      setNewCardTitle("");

      if (openAfterSave && newTask && onTaskClick) {
        // CMD+Enter: Add and open for editing
        cancelAdding();
        onTaskClick(newTask);
      } else {
        // Enter: Quick add and keep input focused
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsSaving(false);
    }
  }, [newCardTitle, onAddTask, column.id, isSaving, onTaskClick, cancelAdding]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const openAfterSave = e.metaKey || e.ctrlKey;
      handleSaveCard(openAfterSave);
    } else if (e.key === "Escape") {
      cancelAdding();
    }
  }, [handleSaveCard, cancelAdding]);

  const colorHex = columnColors[column.color || "slate"] || columnColors.slate;
  const isOverLimit = column.wip_limit && tasks.length >= column.wip_limit;

  return (
    <div
      data-column-id={column.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex flex-col w-[85vw] sm:w-[280px] min-w-[85vw] sm:min-w-[280px] max-h-[calc(100vh-200px)]
        bg-bg-secondary rounded-xl
        transition-all duration-150 ease-out
        snap-center sm:snap-align-none
        ${isOver ? "ring-2 ring-primary/50" : ""}
      `}
    >
      {/* Column Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/[0.04] select-none"
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

      {/* Quick Add Card Section */}
      <div className="p-2 pt-0">
        {isAdding ? (
          <div ref={formRef} className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter card title..."
              disabled={isSaving}
              className="
                w-full px-3 py-2.5
                text-[13px] text-foreground
                bg-bg-elevated border border-primary rounded-[10px]
                placeholder:text-foreground-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50
                disabled:opacity-50
              "
            />
            <div className="flex items-center gap-2 text-xs text-foreground-muted flex-wrap">
              <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">Enter</kbd> to add</span>
              <span>·</span>
              <span><kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">⌘ Enter</kbd> to open</span>
              <span>·</span>
              <button
                onClick={cancelAdding}
                className="hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
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
        )}
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

// Memoise to prevent re-renders when other columns change
export const TaskColumn = memo(TaskColumnComponent);
