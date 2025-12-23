"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import { TaskKanbanBoard } from "@/components/projects/TaskKanbanBoard";
import { TaskDetailModal } from "@/components/projects/TaskDetailModal";
import { UnifiedFilterBar, type FilterValue } from "@/components/filters";
import { getGlobalColumns } from "@/lib/api/columns";
import { getIdeas } from "@/lib/api/ideas";
import { getLabels } from "@/lib/api/labels";
import { createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import { createClient } from "@/lib/supabase/client";
import type { DbColumn, DbTask, DbIdea, DbLabel } from "@/types/database";

interface TaskBoardProps {
  initialIdeaFilter?: string;
  initialTaskId?: string;
}

export function TaskBoard({ initialIdeaFilter, initialTaskId }: TaskBoardProps) {
  const [columns, setColumns] = useState<DbColumn[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [allLabels, setAllLabels] = useState<DbLabel[]>([]);
  const [taskLabels, setTaskLabels] = useState<Record<string, DbLabel[]>>({});
  const [checklistProgress, setChecklistProgress] = useState<
    Record<string, { completed: number; total: number }>
  >({});
  const [taskAttachmentCounts, setTaskAttachmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic filter state - smart chips for multi-criteria filtering
  const [filters, setFilters] = useState<FilterValue[]>(() => {
    // Initialise with idea filter if provided
    if (initialIdeaFilter) {
      return [{
        id: `linkedIdea-${initialIdeaFilter}`,
        type: "linkedIdea" as const,
        value: [initialIdeaFilter],
        displayLabel: "Loading...", // Will be updated after ideas load
      }];
    }
    return [];
  });

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<DbTask | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open task modal when initialTaskId is provided
  useEffect(() => {
    if (initialTaskId && tasks.length > 0 && !selectedTask) {
      const task = tasks.find((t) => t.id === initialTaskId);
      if (task) {
        setSelectedTask(task);
        setIsNewTask(false);
      }
    }
  }, [initialTaskId, tasks, selectedTask]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load columns (global user columns) - auto-seeds defaults if none exist
      const columnsData = await getGlobalColumns();

      // Load all non-archived ideas for linking
      const ideasData = await getIdeas({
        archived: false,
      });

      // Load all labels for filtering
      const labelsData = await getLabels();

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

      // Load task attachment counts
      const { data: attachments } = await supabase
        .from("attachments")
        .select("task_id")
        .not("task_id", "is", null);

      const attachmentCounts: Record<string, number> = {};
      attachments?.forEach((att: { task_id: string | null }) => {
        if (att.task_id) {
          attachmentCounts[att.task_id] = (attachmentCounts[att.task_id] || 0) + 1;
        }
      });

      setColumns(columnsData);
      setTasks(tasksData || []);
      setIdeas(ideasData);
      setAllLabels(labelsData);
      setTaskLabels(labelsMap);
      setChecklistProgress(progressMap);
      setTaskAttachmentCounts(attachmentCounts);

      // Update initial idea filter label if present
      if (initialIdeaFilter) {
        const matchingIdea = ideasData.find((i) => i.id === initialIdeaFilter);
        if (matchingIdea) {
          setFilters((prev) =>
            prev.map((f) =>
              f.type === "linkedIdea" && Array.isArray(f.value) && f.value.includes(initialIdeaFilter)
                ? { ...f, displayLabel: matchingIdea.title }
                : f
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to load task board data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Only count tasks that are on the board (have column_id)
  const boardTasks = useMemo(() => tasks.filter(t => t.column_id), [tasks]);

  // Filter tasks based on active filter chips and search query
  const filteredTasks = useMemo(() => {
    let result = boardTasks;

    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((task) => {
        // Search in task title
        if (task.title?.toLowerCase().includes(query)) return true;
        // Search in task description
        if (task.description?.toLowerCase().includes(query)) return true;
        // Search in linked idea title
        if (task.idea_id) {
          const idea = ideas.find((i) => i.id === task.idea_id);
          if (idea?.title?.toLowerCase().includes(query)) return true;
        }
        // Search in task labels
        const labels = taskLabels[task.id] || [];
        if (labels.some((l) => l.name?.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    // Then apply structured filters
    if (filters.length === 0) {
      return result;
    }

    return result.filter((task) => {
      // Check each filter type - all must match (AND logic between types, OR within type)
      for (const filter of filters) {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];

        switch (filter.type) {
          case "linkedIdea": {
            // Task must be linked to one of the selected ideas
            if (!task.idea_id || !values.includes(task.idea_id)) {
              return false;
            }
            break;
          }

          case "label": {
            // Task must have at least one of the selected labels
            const taskLabelIds = (taskLabels[task.id] || []).map((l) => l.id);
            const hasMatchingLabel = values.some((v) => taskLabelIds.includes(v as string));
            if (!hasMatchingLabel) return false;
            break;
          }

          case "priority": {
            // Task must have one of the selected priorities
            if (!task.priority || !values.includes(task.priority)) {
              return false;
            }
            break;
          }

          case "dueDate": {
            const dueDateValue = values[0] as string;
            if (!task.due_date) {
              if (dueDateValue !== "no-date") return false;
            } else {
              const dueDate = new Date(task.due_date);
              dueDate.setHours(0, 0, 0, 0);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const endOfWeek = new Date(today);
              endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
              const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

              switch (dueDateValue) {
                case "overdue":
                  if (dueDate >= today) return false;
                  break;
                case "today":
                  if (dueDate.getTime() !== today.getTime()) return false;
                  break;
                case "this-week":
                  if (dueDate < today || dueDate > endOfWeek) return false;
                  break;
                case "this-month":
                  if (dueDate < today || dueDate > endOfMonth) return false;
                  break;
                case "no-date":
                  return false; // Task has a due date
              }
            }
            break;
          }

          case "column": {
            // Task must be in one of the selected columns
            if (!task.column_id || !values.includes(task.column_id)) {
              return false;
            }
            break;
          }

          case "completed": {
            // Boolean filter - task must be completed
            if (!task.completed) return false;
            break;
          }

          case "hasAttachment": {
            // Check if task has any attachments
            const attachmentCount = taskAttachmentCounts[task.id] || 0;
            if (attachmentCount === 0) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [boardTasks, filters, taskLabels, searchQuery, ideas, taskAttachmentCounts]);

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
    // Auto-link to first idea in filter if there's exactly one idea filter with one value
    const ideaFilter = filters.find((f) => f.type === "linkedIdea");
    const ideaValues = ideaFilter && Array.isArray(ideaFilter.value) ? ideaFilter.value : [];
    const ideaId = ideaValues.length === 1 ? ideaValues[0] : null;

    const newTask = await createTask({
      title,
      column_id: columnId,
      completed: false,
      idea_id: ideaId,
    });
    setTasks((prev) => [...prev, newTask]);
    // Return the task so CMD+Enter can open it
    return newTask;
  };

  // Refresh attachment counts when attachments change in task modal
  const refreshAttachmentCounts = useCallback(async () => {
    const supabase = createClient();
    const { data: attachments } = await supabase
      .from("attachments")
      .select("task_id")
      .not("task_id", "is", null);

    const counts: Record<string, number> = {};
    attachments?.forEach((att: { task_id: string | null }) => {
      if (att.task_id) {
        counts[att.task_id] = (counts[att.task_id] || 0) + 1;
      }
    });
    setTaskAttachmentCounts(counts);
  }, []);

  // Refresh task labels when labels change in task modal
  const refreshLabels = useCallback(async () => {
    const supabase = createClient();
    const { data: labelRelations } = await supabase
      .from("task_labels")
      .select("task_id, labels(*)");

    const labelsMap: Record<string, DbLabel[]> = {};
    labelRelations?.forEach((rel: any) => {
      if (!labelsMap[rel.task_id]) labelsMap[rel.task_id] = [];
      if (rel.labels) labelsMap[rel.task_id].push(rel.labels as DbLabel);
    });
    setTaskLabels(labelsMap);
  }, []);

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

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and FilterBar on single row */}
      <div className="relative z-20 flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 border-b border-border shrink-0 overflow-x-auto overflow-y-visible">
        {/* Search input - compact */}
        <div className="relative shrink-0 w-48 md:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border shrink-0" />

        {/* Filter chips - flex grow */}
        <UnifiedFilterBar
          context="tasks"
          filters={filters}
          onFiltersChange={setFilters}
          ideas={ideas}
          labels={allLabels}
          columns={columns}
          className="flex-1 min-w-0"
        />

        {/* Task count - right side */}
        <div className="text-xs text-muted-foreground shrink-0 ml-auto">
          {filteredTasks.length}{(searchQuery || filters.length > 0) && boardTasks.length !== filteredTasks.length ? `/${boardTasks.length}` : ""} {filteredTasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="relative z-10 flex-1 p-4 md:p-6 overflow-hidden">
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
          onAttachmentChange={refreshAttachmentCounts}
          onLabelsChange={refreshLabels}
        />
      )}
    </div>
  );
}
