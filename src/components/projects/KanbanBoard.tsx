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
import { KanbanColumn } from "./KanbanColumn";
import { ProjectCard } from "./ProjectCard";
import { reorderProjects } from "@/lib/api/projects";
import type { DbProject, ProjectStatus } from "@/types/database";

interface KanbanBoardProps {
  projects: DbProject[];
  onProjectsChange: (projects: DbProject[]) => void;
  onProjectClick?: (project: DbProject) => void;
  onProjectEdit?: (project: DbProject) => void;
  onProjectDelete?: (project: DbProject) => void;
  onAddProject?: (status: ProjectStatus) => void;
}

const COLUMNS: { id: ProjectStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "planning", title: "Planning" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard({
  projects,
  onProjectsChange,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
  onAddProject,
}: KanbanBoardProps) {
  const [activeProject, setActiveProject] = useState<DbProject | null>(null);

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

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, DbProject[]> = {
      backlog: [],
      planning: [],
      in_progress: [],
      review: [],
      done: [],
      archived: [],
    };

    projects.forEach((project) => {
      if (grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });

    // Sort each column by position
    Object.keys(grouped).forEach((status) => {
      grouped[status as ProjectStatus].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [projects]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
    }
  }, [projects]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) return;

    // Check if dropping on a column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      const newStatus = overId as ProjectStatus;
      if (activeProject.status !== newStatus) {
        // Move to new column
        const updatedProjects = projects.map((p) =>
          p.id === activeId
            ? { ...p, status: newStatus, position: projectsByStatus[newStatus].length }
            : p
        );
        onProjectsChange(updatedProjects);
      }
      return;
    }

    // Check if dropping on another project
    const overProject = projects.find((p) => p.id === overId);
    if (overProject && activeProject.id !== overProject.id) {
      const activeIndex = projects.findIndex((p) => p.id === activeId);
      const overIndex = projects.findIndex((p) => p.id === overId);

      if (activeProject.status !== overProject.status) {
        // Moving to different column
        const updatedProjects = projects.map((p) =>
          p.id === activeId
            ? { ...p, status: overProject.status, position: overProject.position }
            : p
        );
        onProjectsChange(updatedProjects);
      } else {
        // Reorder within same column
        const reordered = arrayMove(projects, activeIndex, overIndex);
        onProjectsChange(reordered);
      }
    }
  }, [projects, projectsByStatus, onProjectsChange]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveProject(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const project = projects.find((p) => p.id === activeId);
    if (!project) return;

    // Recalculate positions for all projects in affected columns
    const affectedStatuses = new Set<ProjectStatus>();
    projects.forEach((p) => affectedStatuses.add(p.status));

    const updates: { id: string; status: ProjectStatus; position: number }[] = [];

    affectedStatuses.forEach((status) => {
      const columnProjects = projects
        .filter((p) => p.status === status)
        .sort((a, b) => {
          // Use array index as position for now
          const aIndex = projects.findIndex((x) => x.id === a.id);
          const bIndex = projects.findIndex((x) => x.id === b.id);
          return aIndex - bIndex;
        });

      columnProjects.forEach((p, index) => {
        if (p.position !== index || p.status !== status) {
          updates.push({ id: p.id, status, position: index });
        }
      });
    });

    // Persist changes to database
    if (updates.length > 0) {
      try {
        await reorderProjects(updates);
      } catch (error) {
        console.error("Failed to save project positions:", error);
      }
    }
  }, [projects]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            projects={projectsByStatus[column.id]}
            onAddProject={() => onAddProject?.(column.id)}
            onProjectClick={onProjectClick}
            onProjectEdit={onProjectEdit}
            onProjectDelete={onProjectDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && (
          <div className="rotate-3 opacity-90">
            <ProjectCard project={activeProject} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
