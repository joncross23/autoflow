"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Loader2, ChevronDown, ExternalLink, X, Search, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [columns, setColumns] = useState<DbColumn[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [taskLabels, setTaskLabels] = useState<Record<string, DbLabel[]>>({});
  const [checklistProgress, setChecklistProgress] = useState<
    Record<string, { completed: number; total: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state - single idea selection for "project board" feel
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(
    initialIdeaFilter || null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<DbTask | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Only count tasks that are on the board (have column_id)
  const boardTasks = useMemo(() => tasks.filter(t => t.column_id), [tasks]);

  // Filter tasks based on selected idea
  const filteredTasks = useMemo(() => {
    if (!selectedIdeaId) {
      return boardTasks;
    }
    return boardTasks.filter(t => t.idea_id === selectedIdeaId);
  }, [boardTasks, selectedIdeaId]);

  // Count board tasks per idea (only tasks with column_id)
  const ideasWithTasks = useMemo(() => {
    const ideaTaskCounts: Record<string, number> = {};
    boardTasks.forEach((task) => {
      if (task.idea_id) {
        ideaTaskCounts[task.idea_id] = (ideaTaskCounts[task.idea_id] || 0) + 1;
      }
    });
    return ideas.map((idea) => ({
      ...idea,
      taskCount: ideaTaskCounts[idea.id] || 0,
    }));
  }, [ideas, boardTasks]);

  // Filter ideas by search
  const filteredIdeas = useMemo(() => {
    if (!searchQuery) return ideasWithTasks;
    return ideasWithTasks.filter((idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ideasWithTasks, searchQuery]);

  const selectIdea = (ideaId: string | null) => {
    setSelectedIdeaId(ideaId);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleTasksChange = (updatedTasks: DbTask[]) => {
    setTasks(updatedTasks);
  };

  // Task modal handlers
  const handleTaskClick = (task: DbTask) => {
    setSelectedTask(task);
    setIsNewTask(false); // Clicking existing task
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
      idea_id: selectedIdeaId,  // Auto-link to filtered idea
    });
    setTasks((prev) => [...prev, newTask]);
    // Open modal for the new task
    setSelectedTask(newTask);
    setIsNewTask(true);
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

  // Get selected idea title for header display
  const selectedIdea = selectedIdeaId
    ? ideas.find((i) => i.id === selectedIdeaId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border shrink-0">
        {/* Idea Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors min-w-[200px] max-w-[300px]",
              selectedIdeaId
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-bg-hover"
            )}
          >
            <Lightbulb className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium truncate flex-1 text-left">
              {selectedIdea ? selectedIdea.title : "All Ideas"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                showDropdown && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 top-full mt-1 w-80 bg-bg-elevated border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ideas..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-bg-tertiary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-64 overflow-y-auto p-1">
                {/* All Ideas option */}
                <button
                  onClick={() => selectIdea(null)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors",
                    !selectedIdeaId ? "bg-primary/10 text-primary" : "hover:bg-bg-hover"
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {!selectedIdeaId && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-medium">All Ideas</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {boardTasks.length} tasks
                  </span>
                </button>

                {filteredIdeas.length > 0 && (
                  <div className="h-px bg-border my-1" />
                )}

                {/* Ideas list */}
                {filteredIdeas.length === 0 && searchQuery && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No ideas match &quot;{searchQuery}&quot;
                  </div>
                )}
                {filteredIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => selectIdea(idea.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors group",
                      selectedIdeaId === idea.id ? "bg-primary/10 text-primary" : "hover:bg-bg-hover"
                    )}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {selectedIdeaId === idea.id && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{idea.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {idea.taskCount} {idea.taskCount === 1 ? "task" : "tasks"}
                    </span>
                    <Link
                      href={`/dashboard/ideas?selected=${idea.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity shrink-0"
                      title="View idea"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Task count */}
        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </div>

        {/* Clear filter button */}
        {selectedIdeaId && (
          <button
            onClick={() => selectIdea(null)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          ideaTitle={getIdeaTitle(selectedTask.idea_id)}
          isNew={isNewTask}
          onClose={() => {
            setSelectedTask(null);
            setIsNewTask(false);
          }}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
