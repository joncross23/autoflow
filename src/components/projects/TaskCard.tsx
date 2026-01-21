"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Trash2,
  Clock,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import type { DbTask, DbLabel } from "@/types/database";
import { LABEL_COLOR_CLASSES } from "@/types/database";
import { AvatarStack } from "@/components/ui/Avatar";

interface TaskCardAssignee {
  initials: string;
  name?: string;
}

interface TaskCardProps {
  task: DbTask;
  labels?: DbLabel[];
  assignees?: TaskCardAssignee[];
  checklistProgress?: { completed: number; total: number };
  commentCount?: number;
  attachmentCount?: number;
  onClick?: (task: DbTask) => void;
  onToggle?: (task: DbTask) => void;
  onEdit?: (task: DbTask) => void;
  onDelete?: (task: DbTask) => void;
  isDragging?: boolean;
  isGhost?: boolean;
}

function TaskCardComponent({
  task,
  labels = [],
  assignees = [],
  checklistProgress,
  commentCount,
  attachmentCount,
  onClick,
  onToggle,
  onEdit,
  onDelete,
  isDragging = false,
  isGhost = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get label colour class from hex (normalizes case)
  const getLabelColorClass = (hex: string): string => {
    const normalized = hex.toLowerCase();
    return LABEL_COLOR_CLASSES[normalized] || "bg-blue-500";
  };

  // Format due date
  const formatDueDate = (date: string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Safely access due_date (may not exist in DB yet)
  const dueDate = task.due_date ?? null;

  // Check if task is overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date() && !task.completed;

  // Compute progress from checklist items
  const progress = checklistProgress && checklistProgress.total > 0
    ? Math.round((checklistProgress.completed / checklistProgress.total) * 100)
    : task.completed
      ? 100
      : undefined;

  // Check if we have footer indicators to show
  const hasFooterContent = task.priority || dueDate || checklistProgress || commentCount || attachmentCount || assignees.length > 0;

  // Priority color helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-blue-400";
      default: return "text-foreground-muted";
    }
  };

  const showHover = isHovered && !isDragging && !isGhost;
  const isBeingDragged = isSortableDragging || isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`task-card-${task.id}`}
      {...attributes}
      {...listeners}
      onMouseEnter={() => !isBeingDragged && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group rounded-[10px] p-3 select-none
        transition-all duration-150 ease-out shadow-sm
        tap-transparent no-select touch-target
        ${isBeingDragged || isDragging
          ? "cursor-grabbing"
          : "cursor-grab"
        }
        ${isGhost
          ? "bg-bg-tertiary opacity-40"
          : "bg-bg-elevated"
        }
        ${showHover ? "shadow-lg -translate-y-0.5 ring-1 ring-primary/50" : ""}
        ${isBeingDragged ? "rotate-[1.5deg] shadow-xl opacity-95" : ""}
        ${task.completed && !isGhost ? "opacity-60" : ""}
      `}
      onClick={() => onClick?.(task)}
    >
      {/* Labels - at the top */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.map((label) => (
            <span
              key={label.id}
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded text-white min-w-[16px] ${
                isGhost
                  ? "bg-border text-foreground-muted"
                  : getLabelColorClass(label.color)
              }`}
            >
              {label.name || "\u00A0"}
            </span>
          ))}
        </div>
      )}

      {/* Title row with checkbox */}
      <div className={`flex items-start gap-2 relative ${task.completed ? 'pl-7' : ''}`}>
        {/* Checkbox - hover-to-reveal, always visible when checked */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(task);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`
            absolute left-[-4px] top-[2px]
            p-1 shrink-0 touch-target-sm
            transition-opacity duration-200
            text-foreground-muted hover:text-primary
            ${task.completed
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
            }
          `}
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        {/* Title - slides right on hover to reveal checkbox */}
        <p
          data-testid={`task-title-${task.id}`}
          onClick={() => onClick?.(task)}
          className={`
            flex-1 text-[13px] font-medium leading-[1.4] cursor-pointer
            transition-transform duration-200 ease-out
            ${!task.completed && 'group-hover:translate-x-7'}
            ${isGhost
              ? "text-foreground-muted"
              : task.completed
                ? "line-through text-foreground-muted"
                : "text-foreground"
            }
          `}
        >
          {task.title}
        </p>

        {/* Actions menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="p-1 text-foreground-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-bg-elevated border border-border rounded-lg py-1 shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-error hover:bg-error/10"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar - full width like mockup */}
      {progress !== undefined && progress > 0 && (
        <div className="mt-2">
          <div className={`h-1 rounded-full overflow-hidden ${
            isGhost ? "bg-border/50" : "bg-bg-tertiary/50"
          }`}>
            <div
              className={`h-full rounded-full transition-all ${
                isGhost
                  ? "bg-foreground-muted"
                  : progress === 100
                    ? "bg-success"
                    : "bg-primary"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer - due date, indicators, assignees */}
      {hasFooterContent && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            {/* Priority */}
            {task.priority && (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${getPriorityColor(task.priority)}`}>
                <AlertCircle className="h-3 w-3" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}

            {/* Checklist progress */}
            {checklistProgress && checklistProgress.total > 0 && (
              <span className={`flex items-center gap-1 text-[11px] ${
                checklistProgress.completed === checklistProgress.total
                  ? "text-success"
                  : "text-foreground-muted"
              }`}>
                <CheckSquare className="h-3 w-3" />
                {checklistProgress.completed}/{checklistProgress.total}
              </span>
            )}

            {/* Due date */}
            {dueDate && (
              <span className={`flex items-center gap-1 text-[11px] ${
                isOverdue ? "text-error" : "text-foreground-muted"
              }`}>
                <Clock className="h-3 w-3" />
                {formatDueDate(dueDate)}
              </span>
            )}

            {/* Comment count */}
            {commentCount !== undefined && commentCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <MessageSquare className="h-3 w-3" />
                {commentCount}
              </span>
            )}

            {/* Attachment count */}
            {attachmentCount !== undefined && attachmentCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <Paperclip className="h-3 w-3" />
                {attachmentCount}
              </span>
            )}
          </div>

          {/* Assignees */}
          {assignees.length > 0 && (
            <AvatarStack avatars={assignees} size={22} max={3} />
          )}
        </div>
      )}
    </div>
  );
}

// Memoise to prevent re-renders when sibling cards change
export const TaskCard = memo(TaskCardComponent);
