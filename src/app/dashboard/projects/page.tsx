"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { KanbanBoard, ProjectForm } from "@/components/projects";
import { getProjects, deleteProject } from "@/lib/api/projects";
import type { DbProject, ProjectStatus } from "@/types/database";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<DbProject | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ProjectStatus>("backlog");

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleAddProject = (status: ProjectStatus) => {
    setDefaultStatus(status);
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: DbProject) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (project: DbProject) => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleProjectSave = (saved: DbProject) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [...prev, saved];
    });
    setShowForm(false);
    setEditingProject(null);
  };

  const handleProjectsChange = (updated: DbProject[]) => {
    setProjects(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-foreground-secondary">
            Track automation projects on your Kanban board
          </p>
        </div>
        <button
          onClick={() => handleAddProject("backlog")}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projects={projects}
          onProjectsChange={handleProjectsChange}
          onProjectClick={handleEditProject}
          onProjectEdit={handleEditProject}
          onProjectDelete={handleDeleteProject}
          onAddProject={handleAddProject}
        />
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject || undefined}
          defaultStatus={defaultStatus}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          onSave={handleProjectSave}
        />
      )}
    </div>
  );
}
