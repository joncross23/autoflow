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
  Calendar,
  Tag,
  Users,
  Paperclip,
  Link as LinkIcon,
  MessageSquare,
  Activity,
  Sparkles,
  Move,
  Copy,
  Eye,
  Archive,
  Share2,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { updateTask } from "@/lib/api/tasks";
import {
  getTaskChecklistsWithItems,
  toggleChecklistItem,
  createChecklistItem,
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

// Section component for consistent styling
function Section({
  icon: Icon,
  title,
  children,
  onAdd,
  addLabel,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Icon className="h-4 w-4" />
          {title}
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-foreground-muted" />
          ) : (
            <ChevronRight className="h-3 w-3 text-foreground-muted" />
          )}
        </button>
        {onAdd && isOpen && (
          <button
            onClick={onAdd}
            className="text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            + {addLabel || "Add"}
          </button>
        )}
      </div>
      {isOpen && children}
    </div>
  );
}

// Sidebar action button
function SidebarButton({
  icon: Icon,
  label,
  onClick,
  active,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  variant?: "default" | "ai" | "danger";
}) {
  const variantClasses = {
    default: active
      ? "bg-primary/20 text-primary"
      : "bg-bg-tertiary hover:bg-bg-hover text-foreground-secondary hover:text-foreground",
    ai: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
    danger: "bg-error/10 text-error hover:bg-error/20",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${variantClasses[variant]}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
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
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [showActivity, setShowActivity] = useState(false);

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
  const handleSave = useCallback(async () => {
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
  }, [hasChanges, task.id, title, description, onSave]);

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

  // Add new checklist item
  const handleAddItem = async (checklistId: string) => {
    const text = newItemText[checklistId]?.trim();
    if (!text) return;

    try {
      const newItem = await createChecklistItem({
        checklist_id: checklistId,
        title: text,
        position: checklists.find((c) => c.checklist.id === checklistId)?.items.length || 0,
      });

      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.checklist.id !== checklistId) return cl;
          const newItems = [...cl.items, newItem];
          const completed = newItems.filter((i) => i.done).length;
          return {
            ...cl,
            items: newItems,
            progress: {
              total: newItems.length,
              completed,
              percentage: newItems.length > 0 ? Math.round((completed / newItems.length) * 100) : 0,
            },
          };
        })
      );

      setNewItemText((prev) => ({ ...prev, [checklistId]: "" }));
    } catch (error) {
      console.error("Failed to add item:", error);
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl my-8 mx-4">
        <div className="bg-bg-secondary rounded-xl overflow-hidden shadow-2xl border border-border">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6 min-w-0">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm text-foreground-muted">
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span>Task</span>
                  <span className="px-2 py-0.5 bg-bg-tertiary rounded font-mono text-xs">
                    {task.id.slice(0, 8)}
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-foreground-muted"
                  placeholder="Task title"
                />
              </div>

              {/* Labels */}
              {labels.length > 0 && (
                <Section icon={Tag} title="Labels" onAdd={() => {}} addLabel="Add">
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <span
                        key={label.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border ${
                          labelColorClasses[label.color] || labelColorClasses.slate
                        }`}
                      >
                        {label.name}
                        <button className="opacity-60 hover:opacity-100">×</button>
                      </span>
                    ))}
                    <button className="px-2.5 py-1 text-xs font-medium rounded border border-dashed border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors">
                      + Add
                    </button>
                  </div>
                </Section>
              )}

              {/* Dates - Placeholder */}
              <Section icon={Calendar} title="Dates">
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs text-foreground-muted mb-1">Start</div>
                    <button className="px-3 py-1.5 bg-bg-tertiary rounded text-sm text-foreground-secondary hover:text-foreground">
                      Set date
                    </button>
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted mb-1">Due</div>
                    <button className="px-3 py-1.5 bg-bg-tertiary rounded text-sm text-foreground-secondary hover:text-foreground">
                      Set date
                    </button>
                  </div>
                </div>
              </Section>

              {/* Description */}
              <Section icon={MoreHorizontal} title="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-bg-tertiary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a more detailed description..."
                />
              </Section>

              {/* Checklists */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
                </div>
              ) : checklists.length > 0 ? (
                <div className="space-y-4">
                  {checklists.map(({ checklist, items, progress }) => (
                    <div key={checklist.id} className="border border-border rounded-lg overflow-hidden">
                      {/* Checklist header */}
                      <button
                        onClick={() => toggleChecklist(checklist.id)}
                        className="w-full flex items-center justify-between p-3 bg-bg-tertiary hover:bg-bg-hover transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-foreground-muted" />
                          <span className="font-medium text-sm">{checklist.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-foreground-muted">
                            {progress.completed}/{progress.total}
                          </span>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                progress.percentage === 100 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          {expandedChecklists.has(checklist.id) ? (
                            <ChevronDown className="h-4 w-4 text-foreground-muted" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-foreground-muted" />
                          )}
                        </div>
                      </button>

                      {/* Checklist items */}
                      {expandedChecklists.has(checklist.id) && (
                        <div className="p-3 space-y-1">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleToggleItem(item.id, checklist.id)}
                              className="flex items-center gap-3 w-full p-2 text-left rounded-md hover:bg-bg-tertiary transition-colors group"
                            >
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                  item.done
                                    ? "bg-primary border-primary"
                                    : "border-border group-hover:border-primary"
                                }`}
                              >
                                {item.done && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={`text-sm flex-1 ${
                                  item.done ? "line-through text-foreground-muted" : ""
                                }`}
                              >
                                {item.title}
                              </span>
                            </button>
                          ))}

                          {/* Add item input */}
                          <div className="flex items-center gap-2 pt-2">
                            <Plus className="h-4 w-4 text-foreground-muted" />
                            <input
                              type="text"
                              value={newItemText[checklist.id] || ""}
                              onChange={(e) =>
                                setNewItemText((prev) => ({
                                  ...prev,
                                  [checklist.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddItem(checklist.id);
                                }
                              }}
                              placeholder="Add an item..."
                              className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted"
                            />
                            {newItemText[checklist.id] && (
                              <button
                                onClick={() => handleAddItem(checklist.id)}
                                className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Activity */}
              <Section icon={Activity} title="Activity" defaultOpen={false}>
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="text-xs text-foreground-muted hover:text-foreground"
                >
                  {showActivity ? "Hide" : "Show"} details
                </button>
                {showActivity && (
                  <div className="mt-3 space-y-2 text-sm text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">●</span>
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </div>
                    {task.updated_at && task.updated_at !== task.created_at && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">●</span>
                        Updated {new Date(task.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </Section>
            </div>

            {/* Sidebar */}
            <div className="w-48 p-4 bg-bg-tertiary border-l border-border shrink-0">
              {/* Save button */}
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full btn btn-primary mb-4"
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

              <div className="space-y-4">
                {/* Add to card */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    Add to card
                  </div>
                  <div className="space-y-1">
                    <SidebarButton icon={Users} label="Members" />
                    <SidebarButton icon={Tag} label="Labels" />
                    <SidebarButton icon={CheckCircle2} label="Checklist" />
                    <SidebarButton icon={Calendar} label="Dates" />
                    <SidebarButton icon={Paperclip} label="Attachment" />
                    <SidebarButton icon={LinkIcon} label="Link" />
                  </div>
                </div>

                {/* AI */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    AI
                  </div>
                  <div className="space-y-1">
                    <SidebarButton icon={Sparkles} label="Analyse" variant="ai" />
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    Actions
                  </div>
                  <div className="space-y-1">
                    <SidebarButton icon={Move} label="Move" />
                    <SidebarButton icon={Copy} label="Copy" />
                    <SidebarButton icon={Eye} label="Watch" />
                    <SidebarButton icon={Archive} label="Archive" />
                    <SidebarButton icon={Share2} label="Share" />
                  </div>
                </div>

                {/* Danger zone */}
                {onDelete && (
                  <div>
                    <div className="space-y-1">
                      <SidebarButton
                        icon={Trash2}
                        label="Delete"
                        variant="danger"
                        onClick={() => onDelete(task)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[10px] text-foreground-muted leading-relaxed">
                  <kbd className="px-1 py-0.5 bg-bg-secondary rounded">Esc</kbd> close
                  {hasChanges && (
                    <>
                      {" · "}
                      <kbd className="px-1 py-0.5 bg-bg-secondary rounded">⌘S</kbd> save
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
