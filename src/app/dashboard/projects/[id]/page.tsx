"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { TaskKanbanBoard } from "@/components/projects";
import { getProject } from "@/lib/api/projects";
import { getProjectColumns } from "@/lib/api/columns";
import { getTasksForProject, createTask, updateTask, toggleTask, deleteTask } from "@/lib/api/tasks";
import { getTaskLabels } from "@/lib/api/labels";
import type { DbProject, DbColumn, DbTask, DbLabel } from "@/types/database";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<DbProject | null>(null);
  const [columns, setColumns] = useState<DbColumn[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [taskLabels, setTaskLabels] = useState<Record<string, DbLabel[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load project, columns, and tasks in parallel
      const [projectData, columnsData, tasksData] = await Promise.all([
        getProject(projectId),
        getProjectColumns(projectId),
        getTasksForProject(projectId),
      ]);

      if (!projectData) {
        setError("Project not found");
        return;
      }

      setProject(projectData);
      setColumns(columnsData);
      setTasks(tasksData);

      // Load labels for all tasks
      const labelsMap: Record<string, DbLabel[]> = {};
      await Promise.all(
        tasksData.map(async (task) => {
          try {
            const labels = await getTaskLabels(task.id);
            labelsMap[task.id] = labels;
          } catch {
            labelsMap[task.id] = [];
          }
        })
      );
      setTaskLabels(labelsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleTasksChange = (updatedTasks: DbTask[]) => {
    setTasks(updatedTasks);
  };

  const handleAddTask = (columnId: string) => {
    setAddingTaskToColumn(columnId);
    setNewTaskTitle("");
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !addingTaskToColumn) return;

    try {
      const task = await createTask({
        project_id: projectId,
        column_id: addingTaskToColumn,
        title: newTaskTitle.trim(),
      });
      setTasks((prev) => [...prev, task]);
      setAddingTaskToColumn(null);
      setNewTaskTitle("");
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleToggleTask = async (task: DbTask) => {
    try {
      const updated = await toggleTask(task.id);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleEditTask = (task: DbTask) => {
    // For now, just log - could open a modal
    console.log("Edit task:", task);
  };

  const handleDeleteTask = async (task: DbTask) => {
    if (!confirm(`Delete "${task.title}"?`)) return;

    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <header className="mb-6 shrink-0">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            {project.description && (
              <p className="text-foreground-secondary mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-muted">
              {tasks.length} tasks · {tasks.filter((t) => t.completed).length} completed
            </span>
          </div>
        </div>
      </header>

      {/* Task Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {columns.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground-muted">
            No columns configured for this project
          </div>
        ) : (
          <TaskKanbanBoard
            columns={columns}
            tasks={tasks}
            taskLabels={taskLabels}
            onTasksChange={handleTasksChange}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>

      {/* Add task modal */}
      {addingTaskToColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Task</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="input w-full mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTask();
                if (e.key === "Escape") setAddingTaskToColumn(null);
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingTaskToColumn(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="btn btn-primary"
                disabled={!newTaskTitle.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
