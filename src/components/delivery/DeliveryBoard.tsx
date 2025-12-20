"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Loader2, Filter, ChevronDown, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TaskKanbanBoard } from "@/components/projects/TaskKanbanBoard";
import { TaskDetailModal } from "@/components/projects/TaskDetailModal";
import { getGlobalColumns } from "@/lib/api/columns";
import { getIdeas } from "@/lib/api/ideas";
import { createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import { createClient } from "@/lib/supabase/client";
import type { DbColumn, DbTask, DbIdea, DbLabel } from "@/types/database";

interface DeliveryBoardProps {
  initialIdeaFilter?: string;
}

export function DeliveryBoard({ initialIdeaFilter }: DeliveryBoardProps) {
  const isMobile = useIsMobile();
  const [columns, setColumns] = useState<DbColumn[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [taskLabels, setTaskLabels] = useState<Record<string, DbLabel[]>>({});
  const [checklistProgress, setChecklistProgress] = useState<
    Record<string, { completed: number; total: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(
    initialIdeaFilter ? new Set([initialIdeaFilter]) : new Set()
  );
  const [showOrphans, setShowOrphans] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<DbTask | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load columns (global user columns) - auto-seeds defaults if none exist
      const columnsData = await getGlobalColumns();

      // Load ideas that have tasks (accepted or doing status)
      const ideasData = await getIdeas({
        status: ["accepted", "doing"],
        archived: false,
      });

      // Load all tasks
      const supabase = createClient();
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });

      if (tasksError) throw tasksError;

      // Load task labels
      const { data: labelRelations } = await supabase
        .from("task_labels")
        .select("task_id, labels(*)");

      const labelsMap: Record<string, DbLabel[]> = {};
      labelRelations?.forEach((rel: any) => {
        if (!labelsMap[rel.task_id]) labelsMap[rel.task_id] = [];
        if (rel.labels) labelsMap[rel.task_id].push(rel.labels as DbLabel);
      });

      // Load checklist progress
      const { data: checklists } = await supabase.from("checklists").select(`
        task_id,
        checklist_items(done)
      `);

      const progressMap: Record<string, { completed: number; total: number }> =
        {};
      checklists?.forEach((cl: any) => {
        if (cl.task_id && cl.checklist_items) {
          const total = cl.checklist_items.length;
          const completed = cl.checklist_items.filter((i: { done: boolean }) => i.done).length;
          if (!progressMap[cl.task_id]) {
            progressMap[cl.task_id] = { completed: 0, total: 0 };
          }
          progressMap[cl.task_id].completed += completed;
          progressMap[cl.task_id].total += total;
        }
      });

      setColumns(columnsData);
      setTasks(tasksData || []);
      setIdeas(ideasData);
      setTaskLabels(labelsMap);
      setChecklistProgress(progressMap);
    } catch (err) {
      console.error("Failed to load delivery data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on selected ideas
  const filteredTasks = useMemo(() => {
    if (selectedIdeaIds.size === 0 && showOrphans) {
      return tasks;
    }

    return tasks.filter((task) => {
      // Show orphan tasks if enabled
      if (!task.idea_id && showOrphans) return true;

      // Show tasks from selected ideas
      if (task.idea_id && selectedIdeaIds.has(task.idea_id)) return true;

      // If no filters selected, show all
      if (selectedIdeaIds.size === 0) return true;

      return false;
    });
  }, [tasks, selectedIdeaIds, showOrphans]);

  // Group ideas by those with tasks vs without
  const ideasWithTasks = useMemo(() => {
    const ideaTaskCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.idea_id) {
        ideaTaskCounts[task.idea_id] = (ideaTaskCounts[task.idea_id] || 0) + 1;
      }
    });
    return ideas.map((idea) => ({
      ...idea,
      taskCount: ideaTaskCounts[idea.id] || 0,
    }));
  }, [ideas, tasks]);

  const orphanTaskCount = tasks.filter((t) => !t.idea_id).length;

  const toggleIdeaFilter = (ideaId: string) => {
    const newSet = new Set(selectedIdeaIds);
    if (newSet.has(ideaId)) {
      newSet.delete(ideaId);
    } else {
      newSet.add(ideaId);
    }
    setSelectedIdeaIds(newSet);
  };

  const clearFilters = () => {
    setSelectedIdeaIds(new Set());
    setShowOrphans(true);
  };

  const handleTasksChange = (updatedTasks: DbTask[]) => {
    setTasks(updatedTasks);
  };

  // Task modal handlers
  const handleTaskClick = (task: DbTask) => {
    setSelectedTask(task);
  };

  const handleTaskSave = (updatedTask: DbTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  };

  const handleTaskDelete = async (task: DbTask) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggleTask = async (task: DbTask) => {
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleAddTask = async (columnId: string, title: string) => {
    const newTask = await createTask({
      title,
      column_id: columnId,
      completed: false,
    });
    setTasks((prev) => [...prev, newTask]);
  };

  // Get parent idea title for task modal
  const getIdeaTitle = (ideaId: string | null) => {
    if (!ideaId) return undefined;
    const idea = ideas.find((i) => i.id === ideaId);
    return idea?.title;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-error">{error}</p>
        <button className="btn btn-outline" onClick={loadData}>
          Try again
        </button>
      </div>
    );
  }

  const hasActiveFilters = selectedIdeaIds.size > 0 || !showOrphans;

  // Filter content component to reuse in sidebar and bottom sheet
  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Filter by Idea</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:text-primary-hover"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Orphan tasks toggle */}
      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={showOrphans}
          onChange={(e) => setShowOrphans(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-secondary text-primary"
        />
        <span className="text-sm">Unassigned tasks</span>
        <span className="text-xs text-muted-foreground ml-auto">
          ({orphanTaskCount})
        </span>
      </label>

      <div className="h-px bg-border mb-4" />

      {/* Ideas list */}
      {ideasWithTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No active ideas. Accept an idea to start tracking tasks.
        </p>
      ) : (
        <div className="space-y-1">
          {ideasWithTasks.map((idea) => (
            <label
              key={idea.id}
              className={cn(
                "flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors",
                selectedIdeaIds.has(idea.id)
                  ? "bg-primary/10"
                  : "hover:bg-bg-hover"
              )}
            >
              <input
                type="checkbox"
                checked={selectedIdeaIds.has(idea.id)}
                onChange={() => toggleIdeaFilter(idea.id)}
                className="h-4 w-4 mt-0.5 rounded border-border bg-bg-secondary text-primary"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm block truncate">{idea.title}</span>
                <span className="text-xs text-muted-foreground">
                  {idea.taskCount} task{idea.taskCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Link
                href={`/dashboard/ideas?selected=${idea.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-muted-foreground hover:text-primary shrink-0"
                title="View idea"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </label>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-full">
      {/* Filter Sidebar - Desktop only */}
      {!isMobile && (
        <div
          className={cn(
            "shrink-0 border-r border-border bg-bg-secondary transition-all duration-200 overflow-hidden",
            showFilterPanel ? "w-64" : "w-0"
          )}
        >
          <div className="w-64 p-4 h-full overflow-y-auto">
            <FilterContent />
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet */}
      {isMobile && showFilterPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowFilterPanel(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary rounded-t-2xl border-t border-border shadow-lg max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Filter by Idea</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-bg-hover rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
              <FilterContent />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-border shrink-0">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
              showFilterPanel || hasActiveFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-bg-hover"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Ideas</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {selectedIdeaIds.size + (showOrphans ? 0 : 1)}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilterPanel && "rotate-180"
              )}
            />
          </button>

          <div className="text-sm text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            {hasActiveFilters && ` (filtered)`}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          {columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground">No columns configured</p>
              <button className="btn btn-primary" onClick={loadData}>
                Reload
              </button>
            </div>
          ) : (
            <TaskKanbanBoard
              columns={columns}
              tasks={filteredTasks}
              taskLabels={taskLabels}
              checklistProgress={checklistProgress}
              onTasksChange={handleTasksChange}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleTaskDelete}
            />
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          ideaTitle={getIdeaTitle(selectedTask.idea_id)}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
