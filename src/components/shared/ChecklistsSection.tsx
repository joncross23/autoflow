"use client";

/**
 * ChecklistsSection Component
 * Displays and manages checklists for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { CheckSquare, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getIdeaChecklistsWithItems,
  getTaskChecklistsWithItems,
  createIdeaChecklist,
  createChecklist,
  deleteChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
} from "@/lib/api/checklists";
import type { DbChecklist, DbChecklistItem, DbChecklistInsert } from "@/types/database";

interface ChecklistsData {
  checklist: DbChecklist;
  items: DbChecklistItem[];
  progress: { total: number; completed: number; percentage: number };
}

interface ChecklistsSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when progress changes */
  onProgressChange?: (total: number, completed: number) => void;
  /** Hide the section header (when wrapped in CollapsibleSection) */
  hideHeader?: boolean;
}

export function ChecklistsSection({
  ideaId,
  taskId,
  className,
  onProgressChange,
  hideHeader = false,
}: ChecklistsSectionProps) {
  const [checklists, setChecklists] = useState<ChecklistsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Load checklists on mount
  useEffect(() => {
    loadChecklists();
  }, [ideaId, taskId]);

  // Update progress callback when checklists change
  useEffect(() => {
    if (onProgressChange) {
      const total = checklists.reduce((sum, c) => sum + c.progress.total, 0);
      const completed = checklists.reduce((sum, c) => sum + c.progress.completed, 0);
      onProgressChange(total, completed);
    }
  }, [checklists, onProgressChange]);

  // Auto-expand all checklists on first load
  useEffect(() => {
    if (checklists.length > 0 && expandedChecklists.size === 0) {
      setExpandedChecklists(new Set(checklists.map((c) => c.checklist.id)));
    }
  }, [checklists]);

  async function loadChecklists() {
    setIsLoading(true);
    try {
      let data: ChecklistsData[] = [];
      if (ideaId) {
        data = await getIdeaChecklistsWithItems(ideaId);
      } else if (taskId) {
        data = await getTaskChecklistsWithItems(taskId);
      }
      setChecklists(data);
    } catch (error) {
      console.error("Error loading checklists:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddChecklist() {
    if (!newChecklistTitle.trim()) return;

    try {
      const position = checklists.length;
      let newChecklist: DbChecklist;

      if (ideaId) {
        newChecklist = await createIdeaChecklist(ideaId, newChecklistTitle.trim(), position);
      } else if (taskId) {
        const checklistData: DbChecklistInsert = {
          task_id: taskId,
          title: newChecklistTitle.trim(),
          position,
        };
        newChecklist = await createChecklist(checklistData);
      } else {
        return;
      }

      setChecklists([
        ...checklists,
        {
          checklist: newChecklist,
          items: [],
          progress: { total: 0, completed: 0, percentage: 0 },
        },
      ]);
      setExpandedChecklists((prev) => new Set([...Array.from(prev), newChecklist.id]));
      setNewChecklistTitle("");
      setShowAddChecklist(false);
    } catch (error) {
      console.error("Error creating checklist:", error);
    }
  }

  async function handleDeleteChecklist(checklistId: string) {
    try {
      await deleteChecklist(checklistId);
      setChecklists(checklists.filter((c) => c.checklist.id !== checklistId));
    } catch (error) {
      console.error("Error deleting checklist:", error);
    }
  }

  function toggleExpanded(checklistId: string) {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      if (next.has(checklistId)) {
        next.delete(checklistId);
      } else {
        next.add(checklistId);
      }
      return next;
    });
  }

  // Calculate total progress
  const totalItems = checklists.reduce((sum, c) => sum + c.progress.total, 0);
  const completedItems = checklists.reduce((sum, c) => sum + c.progress.completed, 0);
  const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header - hidden when wrapped in CollapsibleSection */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <CheckSquare className="w-4 h-4 text-zinc-500" />
            Checklists
            {totalItems > 0 && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                {completedItems}/{totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddChecklist(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      )}

      {/* Add button when header is hidden */}
      {hideHeader && !showAddChecklist && (
        <button
          onClick={() => {
            setShowAddChecklist(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="text-xs text-muted-foreground hover:text-text flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add checklist
        </button>
      )}

      {/* Overall Progress Bar */}
      {totalItems > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Checklist Input */}
      {showAddChecklist && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title"
            className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChecklist();
              if (e.key === "Escape") {
                setShowAddChecklist(false);
                setNewChecklistTitle("");
              }
            }}
          />
          <button
            onClick={handleAddChecklist}
            disabled={!newChecklistTitle.trim()}
            className="px-3 py-2 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddChecklist(false);
              setNewChecklistTitle("");
            }}
            className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Checklists */}
      {isLoading ? (
        <div className="text-xs text-zinc-500">Loading...</div>
      ) : checklists.length === 0 && !showAddChecklist ? (
        <div className="text-xs text-zinc-500">No checklists</div>
      ) : (
        <div className="space-y-3">
          {checklists.map((checklistData) => (
            <ChecklistCard
              key={checklistData.checklist.id}
              data={checklistData}
              isExpanded={expandedChecklists.has(checklistData.checklist.id)}
              onToggleExpanded={() => toggleExpanded(checklistData.checklist.id)}
              onDelete={() => handleDeleteChecklist(checklistData.checklist.id)}
              onUpdate={(newData) => {
                setChecklists(
                  checklists.map((c) =>
                    c.checklist.id === checklistData.checklist.id ? newData : c
                  )
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Checklist Card Component
// ============================================

interface ChecklistCardProps {
  data: ChecklistsData;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onUpdate: (data: ChecklistsData) => void;
}

function ChecklistCard({
  data,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdate,
}: ChecklistCardProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAddItem() {
    if (!newItemTitle.trim()) return;

    try {
      const position = data.items.length;
      const newItem = await createChecklistItem({
        checklist_id: data.checklist.id,
        title: newItemTitle.trim(),
        position,
      });

      const newItems = [...data.items, newItem];
      onUpdate({
        ...data,
        items: newItems,
        progress: {
          total: newItems.length,
          completed: newItems.filter((i) => i.done).length,
          percentage:
            newItems.length > 0
              ? Math.round(
                  (newItems.filter((i) => i.done).length / newItems.length) * 100
                )
              : 0,
        },
      });

      setNewItemTitle("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }

  async function handleToggleItem(itemId: string) {
    try {
      const updatedItem = await toggleChecklistItem(itemId);
      const newItems = data.items.map((i) =>
        i.id === itemId ? updatedItem : i
      );
      onUpdate({
        ...data,
        items: newItems,
        progress: {
          total: newItems.length,
          completed: newItems.filter((i) => i.done).length,
          percentage:
            newItems.length > 0
              ? Math.round(
                  (newItems.filter((i) => i.done).length / newItems.length) * 100
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await deleteChecklistItem(itemId);
      const newItems = data.items.filter((i) => i.id !== itemId);
      onUpdate({
        ...data,
        items: newItems,
        progress: {
          total: newItems.length,
          completed: newItems.filter((i) => i.done).length,
          percentage:
            newItems.length > 0
              ? Math.round(
                  (newItems.filter((i) => i.done).length / newItems.length) * 100
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      {/* Checklist Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50">
        <button
          onClick={onToggleExpanded}
          className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {data.checklist.title}
          <span className="text-xs text-zinc-500">
            {data.progress.completed}/{data.progress.total}
          </span>
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-zinc-500 hover:text-red-400"
          title="Delete checklist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      {data.progress.total > 0 && (
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${data.progress.percentage}%` }}
          />
        </div>
      )}

      {/* Items */}
      {isExpanded && (
        <div className="p-2 space-y-1">
          {data.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={() => handleToggleItem(item.id)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}

          {/* Add Item */}
          {showAddItem ? (
            <div className="flex items-center gap-2 pl-6">
              <input
                ref={inputRef}
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Add an item"
                className="flex-1 px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem();
                    // Keep input focused for adding multiple items
                  }
                  if (e.key === "Escape") {
                    setShowAddItem(false);
                    setNewItemTitle("");
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  setShowAddItem(false);
                  setNewItemTitle("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 w-full pl-6 py-1 text-sm text-zinc-500 hover:text-zinc-300"
            >
              <Plus className="w-3 h-3" />
              Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Checklist Item Row Component
// ============================================

interface ChecklistItemRowProps {
  item: DbChecklistItem;
  onToggle: () => void;
  onDelete: () => void;
}

function ChecklistItemRow({ item, onToggle, onDelete }: ChecklistItemRowProps) {
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onToggle}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          item.done
            ? "bg-cyan-500 border-cyan-500 text-white"
            : "border-zinc-600 hover:border-cyan-500"
        )}
      >
        {item.done && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          item.done ? "text-zinc-500 line-through" : "text-zinc-300"
        )}
      >
        {item.title}
      </span>
      <button
        onClick={onDelete}
        className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete item"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
