"use client";

/**
 * LabelsSection Component
 * Displays and manages labels for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLabels,
  createLabel,
  addIdeaLabel,
  removeIdeaLabel,
  addTaskLabel,
  removeTaskLabel,
  getIdeaLabels,
  getTaskLabels,
} from "@/lib/api/labels";
import type { DbLabel } from "@/types/database";
import { LABEL_COLORS } from "@/types/database";

interface LabelsSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when labels change */
  onLabelsChange?: (labels: DbLabel[]) => void;
}

export function LabelsSection({
  ideaId,
  taskId,
  className,
  onLabelsChange,
}: LabelsSectionProps) {
  const [assignedLabels, setAssignedLabels] = useState<DbLabel[]>([]);
  const [allLabels, setAllLabels] = useState<DbLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[4]); // Blue default
  const [isCreating, setIsCreating] = useState(false);
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

  async function handleAddLabel(label: DbLabel) {
    try {
      if (ideaId) {
        await addIdeaLabel(ideaId, label.id);
      } else if (taskId) {
        await addTaskLabel(taskId, label.id);
      }
      const newAssigned = [...assignedLabels, label];
      setAssignedLabels(newAssigned);
      onLabelsChange?.(newAssigned);
    } catch (error) {
      console.error("Error adding label:", error);
    }
    setShowDropdown(false);
  }

  async function handleRemoveLabel(label: DbLabel) {
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
    if (!newLabelName.trim()) return;

    setIsCreating(true);
    try {
      const newLabel = await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
      });
      setAllLabels([...allLabels, newLabel]);
      setNewLabelName("");
      setShowCreateForm(false);

      // Automatically add the new label to the item
      await handleAddLabel(newLabel);
    } catch (error) {
      console.error("Error creating label:", error);
    } finally {
      setIsCreating(false);
    }
  }

  // Labels available to add (not already assigned)
  const availableLabels = allLabels.filter(
    (label) => !assignedLabels.some((l) => l.id === label.id)
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Tag className="w-4 h-4 text-zinc-500" />
          Labels
          {assignedLabels.length > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {assignedLabels.length}
            </span>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-bg-elevated border border-border rounded-lg shadow-xl z-50">
              {!showCreateForm ? (
                <>
                  {/* Existing labels */}
                  <div className="max-h-48 overflow-y-auto p-1">
                    {availableLabels.length === 0 && allLabels.length > 0 && (
                      <div className="px-3 py-2 text-xs text-zinc-500">
                        All labels assigned
                      </div>
                    )}
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleAddLabel(label)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 rounded"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="truncate">{label.name}</span>
                      </button>
                    ))}
                  </div>
                  {/* Create new option */}
                  <div className="border-t border-border p-1">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-cyan-400 hover:bg-cyan-500/10 rounded"
                    >
                      <Plus className="w-4 h-4" />
                      Create new label
                    </button>
                  </div>
                </>
              ) : (
                /* Create label form */
                <div className="p-3 space-y-3">
                  <div className="text-xs font-medium text-zinc-400">
                    Create Label
                  </div>
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateLabel();
                      if (e.key === "Escape") setShowCreateForm(false);
                    }}
                  />
                  {/* Color picker */}
                  <div className="flex flex-wrap gap-2">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-transform",
                          newLabelColor === color && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {newLabelColor === color && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateLabel}
                      disabled={!newLabelName.trim() || isCreating}
                      className="px-3 py-1.5 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Labels List */}
      <div className="flex flex-wrap gap-1.5">
        {isLoading ? (
          <div className="text-xs text-zinc-500">Loading...</div>
        ) : assignedLabels.length === 0 ? (
          <div className="text-xs text-zinc-500">No labels</div>
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium group",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
      }}
      onClick={onClick}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
