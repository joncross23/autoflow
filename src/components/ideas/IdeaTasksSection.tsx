"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  CheckCircle,
  Circle,
  Loader2,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getGlobalColumns } from "@/lib/api/columns";
import { createTaskLink } from "@/lib/api/links";
import type { DbTask } from "@/types/database";

interface IdeaTasksSectionProps {
  ideaId: string;
  ideaTitle?: string; // Used for auto-linking
}

export function IdeaTasksSection({ ideaId, ideaTitle }: IdeaTasksSectionProps) {
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [defaultColumnId, setDefaultColumnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Load columns to get the default column (Backlog)
      const columns = await getGlobalColumns();
      if (columns.length > 0) {
        setDefaultColumnId(columns[0].id);
      }

      // Load tasks for this idea
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("idea_id", ideaId)
        .order("position", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    setAdding(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          idea_id: ideaId,
          title: newTaskTitle.trim(),
          position: tasks.length,
          completed: false,
          column_id: defaultColumnId, // Add to Backlog so it appears on board
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-create link from task back to idea (for bidirectional linking)
      try {
        await createTaskLink(data.id, {
          url: `idea://${ideaId}`,
          title: ideaTitle || "Parent idea",
          favicon: "💡",
        });
      } catch (linkError) {
        // Don't fail the task creation if link creation fails
        console.error("Failed to create task-idea link:", linkError);
      }

      setTasks([...tasks, data]);
      setNewTaskTitle("");
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const supabase = createClient();
      await supabase
        .from("tasks")
        .update({ completed, updated_at: new Date().toISOString() })
        .eq("id", taskId);

      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Tasks</h3>
        <Link
          href={`/dashboard/tasks?idea=${ideaId}`}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
        >
          View Board
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {completedCount} of {tasks.length} complete
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-2 py-2 px-2 -mx-2 rounded-md hover:bg-bg-hover transition-colors group",
                task.completed && "opacity-60"
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-50 cursor-grab shrink-0" />
              <button
                onClick={() => handleToggleTask(task.id, !task.completed)}
                className="shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm truncate",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add task input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTask();
          }}
          placeholder="Add a task..."
          className="input flex-1 text-sm"
          disabled={adding}
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || adding}
          className="btn btn-sm btn-outline"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
