"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { updateTask } from "@/lib/api/tasks";
import {
  getTaskChecklistsWithItems,
  toggleChecklistItem,
} from "@/lib/api/checklists";
import { getTaskLabels } from "@/lib/api/labels";
import type { DbTask, DbLabel, DbChecklist, DbChecklistItem } from "@/types/database";

interface ChecklistWithItems {
  checklist: DbChecklist;
  items: DbChecklistItem[];
  progress: { total: number; completed: number; percentage: number };
}

interface TaskDetailModalProps {
  task: DbTask;
  onClose: () => void;
  onSave: (task: DbTask) => void;
  onDelete?: (task: DbTask) => void;
}

export function TaskDetailModal({
  task,
  onClose,
  onSave,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [labels, setLabels] = useState<DbLabel[]>([]);
  const [checklists, setChecklists] = useState<ChecklistWithItems[]>([]);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load task details
  const loadTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [labelsData, checklistsData] = await Promise.all([
        getTaskLabels(task.id),
        getTaskChecklistsWithItems(task.id),
      ]);
      setLabels(labelsData);
      setChecklists(checklistsData);
      // Expand all checklists by default
      setExpandedChecklists(new Set(checklistsData.map((c) => c.checklist.id)));
    } catch (error) {
      console.error("Failed to load task details:", error);
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    loadTaskDetails();
  }, [loadTaskDetails]);

  // Track changes
  useEffect(() => {
    const changed = title !== task.title || description !== (task.description || "");
    setHasChanges(changed);
  }, [title, description, task.title, task.description]);

  // Save task
  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);
      const updated = await updateTask(task.id, {
        title,
        description: description || null,
      });
      onSave(updated);
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle checklist item
  const handleToggleItem = async (itemId: string, checklistId: string) => {
    try {
      const updated = await toggleChecklistItem(itemId);
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.checklist.id !== checklistId) return cl;
          const newItems = cl.items.map((item) =>
            item.id === itemId ? updated : item
          );
          const completed = newItems.filter((i) => i.done).length;
          return {
            ...cl,
            items: newItems,
            progress: {
              total: newItems.length,
              completed,
              percentage: Math.round((completed / newItems.length) * 100),
            },
          };
        })
      );
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  };

  // Toggle checklist expansion
  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      if (next.has(checklistId)) {
        next.delete(checklistId);
      } else {
        next.add(checklistId);
      }
      return next;
    });
  };

  // Label color classes
  const labelColorClasses: Record<string, string> = {
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl my-8 mx-4">
        <div className="card p-0 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-foreground-muted" />
              )}
              <span className="text-sm text-foreground-muted">Task</span>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="p-2 text-foreground-muted hover:text-error transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 placeholder:text-foreground-muted"
                placeholder="Task title"
              />
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <span
                    key={label.id}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${
                      labelColorClasses[label.color] || labelColorClasses.slate
                    }`}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input w-full resize-none"
                placeholder="Add a more detailed description..."
              />
            </div>

            {/* Checklists */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
              </div>
            ) : checklists.length > 0 ? (
              <div className="space-y-4">
                {checklists.map(({ checklist, items, progress }) => (
                  <div key={checklist.id} className="border border-border rounded-lg">
                    {/* Checklist header */}
                    <button
                      onClick={() => toggleChecklist(checklist.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {expandedChecklists.has(checklist.id) ? (
                          <ChevronDown className="h-4 w-4 text-foreground-muted" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-foreground-muted" />
                        )}
                        <span className="font-medium">{checklist.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground-muted">
                          {progress.completed}/{progress.total}
                        </span>
                        {/* Progress bar */}
                        <div className="w-20 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Checklist items */}
                    {expandedChecklists.has(checklist.id) && (
                      <div className="px-3 pb-3 space-y-1">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleToggleItem(item.id, checklist.id)}
                            className="flex items-center gap-2 w-full p-2 text-left rounded hover:bg-bg-secondary transition-colors"
                          >
                            {item.done ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-foreground-muted shrink-0" />
                            )}
                            <span
                              className={`text-sm ${
                                item.done
                                  ? "line-through text-foreground-muted"
                                  : ""
                              }`}
                            >
                              {item.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-secondary">
            <span className="text-xs text-foreground-muted">
              Created {new Date(task.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-foreground-muted">
              Press <kbd className="px-1 py-0.5 bg-bg-tertiary rounded text-[10px]">Esc</kbd> to close
              {hasChanges && (
                <>
                  , <kbd className="px-1 py-0.5 bg-bg-tertiary rounded text-[10px]">Cmd+S</kbd> to save
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
