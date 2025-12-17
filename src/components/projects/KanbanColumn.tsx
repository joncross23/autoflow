"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import type { DbProject, ProjectStatus } from "@/types/database";

interface KanbanColumnProps {
  id: ProjectStatus;
  title: string;
  projects: DbProject[];
  onAddProject?: () => void;
  onProjectClick?: (project: DbProject) => void;
  onProjectEdit?: (project: DbProject) => void;
  onProjectDelete?: (project: DbProject) => void;
}

const COLUMN_COLORS: Record<ProjectStatus, string> = {
  backlog: "border-t-slate-500",
  planning: "border-t-purple-500",
  in_progress: "border-t-blue-500",
  review: "border-t-orange-500",
  done: "border-t-green-500",
  archived: "border-t-gray-500",
};

export function KanbanColumn({
  id,
  title,
  projects,
  onAddProject,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div
      className={cn(
        "flex flex-col bg-bg-secondary rounded-lg border border-border border-t-2 min-h-[500px] w-72 shrink-0",
        COLUMN_COLORS[id],
        isOver && "ring-2 ring-primary/50"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="bg-bg-tertiary text-muted-foreground text-xs px-1.5 py-0.5 rounded">
            {projects.length}
          </span>
        </div>
        {onAddProject && (
          <button
            onClick={onAddProject}
            className="p-1 rounded hover:bg-bg-hover"
            title="Add project"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto"
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick?.(project)}
              onEdit={() => onProjectEdit?.(project)}
              onDelete={() => onProjectDelete?.(project)}
            />
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Drop projects here
          </div>
        )}
      </div>
    </div>
  );
}
