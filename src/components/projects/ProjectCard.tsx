"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, Clock, MoreHorizontal, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DbProject, Priority } from "@/types/database";

interface ProjectCardProps {
  project: DbProject;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function ProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: {
      type: "project",
      project,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-bg-elevated border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={onClick}
    >
      {/* Header with drag handle and menu */}
      <div className="flex items-start gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{project.title}</h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/dashboard/projects/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-bg-hover"
            title="View board"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded hover:bg-bg-hover"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-md border bg-bg-elevated shadow-lg"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover transition-colors"
                  style={{ color: "var(--text)" }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover transition-colors text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description preview */}
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 pl-6">
          {project.description}
        </p>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center gap-2 pl-6">
        {/* Priority badge */}
        <span
          className={cn(
            "px-1.5 py-0.5 text-xs rounded border capitalize",
            PRIORITY_COLORS[project.priority]
          )}
        >
          {project.priority}
        </span>

        {/* Due date */}
        {project.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(project.due_date).toLocaleDateString()}
          </div>
        )}

        {/* Estimated hours */}
        {project.estimated_hours && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {project.estimated_hours}h
          </div>
        )}
      </div>
    </div>
  );
}
