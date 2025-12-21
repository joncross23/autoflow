"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { TaskKanbanBoard } from "@/components/projects/TaskKanbanBoard";
import { TaskDetailModal } from "@/components/projects/TaskDetailModal";
import { FilterBar, type FilterChip } from "./FilterBar";
import { getGlobalColumns } from "@/lib/api/columns";
import { getIdeas } from "@/lib/api/ideas";
import { getLabels } from "@/lib/api/labels";
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
  const [allLabels, setAllLabels] = useState<DbLabel[]>([]);
  const [taskLabels, setTaskLabels] = useState<Record<string, DbLabel[]>>({});
  const [checklistProgress, setChecklistProgress] = useState<
    Record<string, { completed: number; total: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic filter state - smart chips for multi-criteria filtering
  const [filters, setFilters] = useState<FilterChip[]>(() => {
    // Initialise with idea filter if provided
    if (initialIdeaFilter) {
      return [{
        id: `idea-${initialIdeaFilter}`,
        type: "idea" as const,
        value: initialIdeaFilter,
        label: "Loading...", // Will be updated after ideas load
      }];
    }
    return [];
  });

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<DbTask | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

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

      setColumns(columnsData);
      setTasks(tasksData || []);
      setIdeas(ideasData);
      setAllLabels(labelsData);
      setTaskLabels(labelsMap);
      setChecklistProgress(progressMap);

      // Update initial idea filter label if present
      if (initialIdeaFilter) {
        const matchingIdea = ideasData.find((i) => i.id === initialIdeaFilter);
        if (matchingIdea) {
          setFilters((prev) =>
            prev.map((f) =>
              f.type === "idea" && f.value === initialIdeaFilter
                ? { ...f, label: matchingIdea.title }
                : f
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to load delivery data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Only count tasks that are on the board (have column_id)
  const boardTasks = useMemo(() => tasks.filter(t => t.column_id), [tasks]);

  // Filter tasks based on active filter chips
  const filteredTasks = useMemo(() => {
    if (filters.length === 0) {
      return boardTasks;
    }

    return boardTasks.filter((task) => {
      // Check each filter type - all must match (AND logic)
      const ideaFilters = filters.filter((f) => f.type === "idea");
      const labelFilters = filters.filter((f) => f.type === "label");
      const dueDateFilters = filters.filter((f) => f.type === "dueDate");
      const priorityFilters = filters.filter((f) => f.type === "priority");

      // Idea filters - task must be linked to at least one of the selected ideas (OR within type)
      if (ideaFilters.length > 0) {
        const matchesIdea = ideaFilters.some((f) => task.idea_id === f.value);
        if (!matchesIdea) return false;
      }

      // Label filters - task must have at least one of the selected labels (OR within type)
      if (labelFilters.length > 0) {
        const taskLabelIds = (taskLabels[task.id] || []).map((l) => l.id);
        const matchesLabel = labelFilters.some((f) => taskLabelIds.includes(f.value));
        if (!matchesLabel) return false;
      }

      // Due date filters
      if (dueDateFilters.length > 0) {
        const matchesDueDate = dueDateFilters.some((f) => {
          if (!task.due_date) {
            return f.value === "no-date";
          }
          const dueDate = new Date(task.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

          switch (f.value) {
            case "overdue":
              return dueDate < today;
            case "today":
              return dueDate.toDateString() === today.toDateString();
            case "this-week":
              return dueDate >= today && dueDate <= endOfWeek;
            case "no-date":
              return false; // Already handled above
            default:
              return true;
          }
        });
        if (!matchesDueDate) return false;
      }

      // Priority filters
      if (priorityFilters.length > 0) {
        const matchesPriority = priorityFilters.some((f) => task.priority === f.value);
        if (!matchesPriority) return false;
      }

      return true;
    });
  }, [boardTasks, filters, taskLabels]);

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
    // Auto-link to first idea in filter if there's exactly one idea filter
    const ideaFilters = filters.filter((f) => f.type === "idea");
    const ideaId = ideaFilters.length === 1 ? ideaFilters[0].value : null;

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
      {/* Header with FilterBar */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border shrink-0">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          ideas={ideas}
          labels={allLabels}
          className="flex-1"
        />

        {/* Task count */}
        <div className="text-sm text-muted-foreground shrink-0">
          {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
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
