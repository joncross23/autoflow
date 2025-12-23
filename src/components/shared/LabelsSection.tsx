"use client";

/**
 * LabelsSection Component
 * Displays and manages labels for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { Tag, Plus, X, Check, Pencil, Square, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLabels,
  createLabel,
  updateLabel,
  addIdeaLabel,
  removeIdeaLabel,
  addTaskLabel,
  removeTaskLabel,
  getIdeaLabels,
  getTaskLabels,
} from "@/lib/api/labels";
import type { DbLabel } from "@/types/database";
import { LABEL_COLORS, LABEL_COLOR_CLASSES } from "@/types/database";

// Helper to get Tailwind class from hex (normalizes case for DB compatibility)
function getLabelColorClass(hex: string): string {
  const normalized = hex.toLowerCase();
  return LABEL_COLOR_CLASSES[normalized] || "bg-blue-500";
}

interface LabelsSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when labels change */
  onLabelsChange?: (labels: DbLabel[]) => void;
  /** Callback to remove/hide this section */
  onRemove?: () => void;
}

export function LabelsSection({
  ideaId,
  taskId,
  className,
  onLabelsChange,
  onRemove,
}: LabelsSectionProps) {
  const [assignedLabels, setAssignedLabels] = useState<DbLabel[]>([]);
  const [allLabels, setAllLabels] = useState<DbLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[4]); // Blue default
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLabel, setEditingLabel] = useState<DbLabel | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load labels on mount
  useEffect(() => {
    loadLabels();
  }, [ideaId, taskId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowCreateForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadLabels() {
    setIsLoading(true);
    try {
      // Get all user labels
      const all = await getLabels();
      setAllLabels(all);

      // Get assigned labels for this item
      let assigned: DbLabel[] = [];
      if (ideaId) {
        assigned = await getIdeaLabels(ideaId);
      } else if (taskId) {
        assigned = await getTaskLabels(taskId);
      }
      setAssignedLabels(assigned);
    } catch (error) {
      console.error("Error loading labels:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Check if a label is assigned
  function isLabelAssigned(label: DbLabel) {
    return assignedLabels.some((l) => l.id === label.id);
  }

  // Toggle label assignment (add if not assigned, remove if assigned)
  async function handleToggleLabel(label: DbLabel) {
    // Guard: require either ideaId or taskId to persist
    if (!ideaId && !taskId) {
      console.error("LabelsSection: No ideaId or taskId provided - cannot persist label toggle");
      return;
    }

    const assigned = isLabelAssigned(label);

    // Optimistic update - update UI immediately in the modal
    const newAssigned = assigned
      ? assignedLabels.filter((l) => l.id !== label.id)
      : [...assignedLabels, label];
    setAssignedLabels(newAssigned);

    try {
      if (assigned) {
        // Remove label from DB
        if (ideaId) {
          await removeIdeaLabel(ideaId, label.id);
        } else if (taskId) {
          await removeTaskLabel(taskId, label.id);
        }
      } else {
        // Add label to DB
        if (ideaId) {
          await addIdeaLabel(ideaId, label.id);
        } else if (taskId) {
          await addTaskLabel(taskId, label.id);
        }
      }
      // Notify parent AFTER DB write succeeds so refreshLabels fetches fresh data
      onLabelsChange?.(newAssigned);
    } catch (error) {
      console.error("Error toggling label:", error);
      // Revert on error
      if (assigned) {
        setAssignedLabels([...assignedLabels, label]);
      } else {
        setAssignedLabels(assignedLabels.filter((l) => l.id !== label.id));
      }
    }
  }

  async function handleRemoveLabel(label: DbLabel) {
    // Guard: require either ideaId or taskId to persist
    if (!ideaId && !taskId) {
      console.error("LabelsSection: No ideaId or taskId provided - cannot persist label removal");
      return;
    }

    try {
      if (ideaId) {
        await removeIdeaLabel(ideaId, label.id);
      } else if (taskId) {
        await removeTaskLabel(taskId, label.id);
      }
      const newAssigned = assignedLabels.filter((l) => l.id !== label.id);
      setAssignedLabels(newAssigned);
      onLabelsChange?.(newAssigned);
    } catch (error) {
      console.error("Error removing label:", error);
    }
  }

  async function handleCreateLabel() {
    setIsCreating(true);
    try {
      const newLabel = await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
      });
      setAllLabels([...allLabels, newLabel]);
      setNewLabelName("");
      setNewLabelColor(LABEL_COLORS[4]); // Reset to blue
      setShowCreateForm(false);

      // Automatically add the new label to the item
      await handleToggleLabel(newLabel);

      // Close dropdown after successful creation
      setShowDropdown(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating label:", error);
    } finally {
      setIsCreating(false);
    }
  }

  function startEditLabel(label: DbLabel) {
    setEditingLabel(label);
    setEditLabelName(label.name);
    setEditLabelColor(label.color);
  }

  async function handleSaveLabel() {
    if (!editingLabel) return;

    setIsSaving(true);
    try {
      const updated = await updateLabel(editingLabel.id, {
        name: editLabelName.trim(),
        color: editLabelColor,
      });
      // Update in all labels list
      setAllLabels(allLabels.map((l) => (l.id === updated.id ? updated : l)));
      // Update in assigned labels if present
      setAssignedLabels(assignedLabels.map((l) => (l.id === updated.id ? updated : l)));
      setEditingLabel(null);
    } catch (error) {
      console.error("Error updating label:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // Filter labels by search query
  const filteredLabels = allLabels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-2 mb-6", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Tag className="w-4 h-4 text-foreground-muted" />
          Labels
          {assignedLabels.length > 0 && (
            <span className="text-xs text-foreground-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              {assignedLabels.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2.5 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>

          {/* Dropdown - Trello-style */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-bg-elevated border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              {editingLabel ? (
                /* Edit label form */
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Edit Label</span>
                    <button
                      onClick={() => setEditingLabel(null)}
                      className="p-1 rounded hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editLabelName}
                    onChange={(e) => setEditLabelName(e.target.value)}
                    placeholder="Label name (optional)"
                    className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveLabel();
                      if (e.key === "Escape") setEditingLabel(null);
                    }}
                  />
                  {/* Colour picker with full bars */}
                  <div className="space-y-1.5">
                    {LABEL_COLORS.map((color) => {
                      const bgClass = getLabelColorClass(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setEditLabelColor(color)}
                          className={cn(
                            "w-full h-8 rounded flex items-center justify-center transition-all",
                            bgClass,
                            editLabelColor === color
                              ? "ring-2 ring-white ring-offset-2 ring-offset-bg-elevated"
                              : "hover:opacity-90"
                          )}
                        >
                          {editLabelColor === color && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingLabel(null)}
                      className="px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLabel}
                      disabled={isSaving}
                      className="px-4 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : !showCreateForm ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Labels</span>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                      className="p-1 rounded hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search labels..."
                      className="w-full px-3 py-1.5 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>

                  {/* Labels list */}
                  <div className="p-2">
                    <div className="text-xs font-medium text-foreground-muted mb-2 px-1">Labels</div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {filteredLabels.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-foreground-muted text-center">
                          {searchQuery ? "No labels found" : "No labels yet"}
                        </div>
                      ) : (
                        filteredLabels.map((label) => {
                          const assigned = isLabelAssigned(label);
                          const bgClass = getLabelColorClass(label.color);
                          return (
                            <div key={label.id} className="flex items-center gap-2">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLabel(label);
                                }}
                                className="p-1.5 rounded hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors"
                              >
                                {assigned ? (
                                  <CheckSquare className="w-5 h-5 text-primary" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                              {/* Full-width coloured bar */}
                              <button
                                onClick={() => handleToggleLabel(label)}
                                className={cn(
                                  "flex-1 px-3 py-2 rounded text-sm font-medium text-white text-left truncate",
                                  bgClass,
                                  "hover:opacity-90 transition-opacity"
                                )}
                              >
                                {label.name || "\u00A0"}
                              </button>
                              {/* Edit button */}
                              <button
                                onClick={() => startEditLabel(label)}
                                className="p-1 text-foreground-muted hover:text-foreground transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Create new option */}
                  <div className="border-t border-border p-2">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-bg-hover rounded transition-colors"
                    >
                      Create a new label
                    </button>
                  </div>
                </>
              ) : (
                /* Create label form */
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Create Label</span>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="p-1 rounded hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name (optional)"
                    className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateLabel();
                      if (e.key === "Escape") setShowCreateForm(false);
                    }}
                  />
                  {/* Colour picker with full bars */}
                  <div className="space-y-1.5">
                    {LABEL_COLORS.map((color) => {
                      const bgClass = getLabelColorClass(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setNewLabelColor(color)}
                          className={cn(
                            "w-full h-8 rounded flex items-center justify-center transition-all",
                            bgClass,
                            newLabelColor === color
                              ? "ring-2 ring-white ring-offset-2 ring-offset-bg-elevated"
                              : "hover:opacity-90"
                          )}
                        >
                          {newLabelColor === color && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateLabel}
                      disabled={isCreating}
                      className="px-4 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-5 h-5 flex items-center justify-center rounded text-foreground-muted hover:bg-error/10 hover:text-error transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Labels List */}
      <div className="flex flex-wrap gap-1.5">
        {isLoading ? (
          <div className="text-xs text-foreground-muted">Loading...</div>
        ) : assignedLabels.length === 0 ? (
          <div className="text-xs text-foreground-muted">No labels</div>
        ) : (
          assignedLabels.map((label) => (
            <LabelChip
              key={label.id}
              label={label}
              onRemove={() => handleRemoveLabel(label)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// Label Chip Component
// ============================================

interface LabelChipProps {
  label: DbLabel;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function LabelChip({ label, onRemove, onClick, className }: LabelChipProps) {
  const bgClass = getLabelColorClass(label.color);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold text-white min-w-[24px]",
        bgClass,
        onClick && "cursor-pointer hover:opacity-90",
        className
      )}
      onClick={onClick}
    >
      {label.name || "\u00A0"}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
