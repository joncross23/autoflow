"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DbTask, DbLabel } from "@/types/database";

interface TaskCardProps {
  task: DbTask;
  labels?: DbLabel[];
  onToggle?: (task: DbTask) => void;
  onEdit?: (task: DbTask) => void;
  onDelete?: (task: DbTask) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  labels = [],
  onToggle,
  onEdit,
  onDelete,
  isDragging = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
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

  const labelColorClasses: Record<string, string> = {
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group card p-3 cursor-default
        ${isSortableDragging || isDragging ? "opacity-50 ring-2 ring-primary" : ""}
        ${task.completed ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 text-foreground-muted hover:text-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle?.(task)}
          className="mt-0.5 text-foreground-muted hover:text-primary transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? "line-through text-foreground-muted" : ""}`}>
            {task.title}
          </p>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {labels.map((label) => (
                <span
                  key={label.id}
                  className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border ${
                    labelColorClasses[label.color] || labelColorClasses.slate
                  }`}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-foreground-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 card py-1 shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit?.(task);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-bg-secondary"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => {
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
    </div>
  );
}
