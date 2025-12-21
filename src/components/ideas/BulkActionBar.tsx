"use client";

import { useState } from "react";
import { Archive, Trash2, Check, X, ChevronDown, Loader2, Tag, Gauge, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { useToast } from "@/hooks/useToast";
import type { IdeaStatus, DbLabel, EffortEstimate, PlanningHorizon } from "@/types/database";

interface BulkActionBarProps {
  selectedCount: number;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
  onStatusChange: (status: IdeaStatus) => Promise<void>;
  onLabelChange?: (labelId: string, action: "add" | "remove") => Promise<void>;
  onEffortChange?: (effort: EffortEstimate) => Promise<void>;
  onHorizonChange?: (horizon: PlanningHorizon) => Promise<void>;
  onClearSelection: () => void;
  availableLabels?: DbLabel[];
}

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "evaluating", label: "Evaluating" },
  { value: "accepted", label: "Accepted" },
  { value: "doing", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "parked", label: "Parked" },
  { value: "dropped", label: "Dropped" },
];

const EFFORT_OPTIONS: { value: EffortEstimate; label: string }[] = [
  { value: "trivial", label: "Trivial" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
];

const HORIZON_OPTIONS: { value: PlanningHorizon; label: string; color: string }[] = [
  { value: "now", label: "Now", color: "bg-green-500/10 text-green-500" },
  { value: "next", label: "Next", color: "bg-blue-500/10 text-blue-500" },
  { value: "later", label: "Later", color: "bg-slate-500/10 text-slate-500" },
  { value: null, label: "Unplanned", color: "bg-bg-tertiary text-muted-foreground" },
];

export function BulkActionBar({
  selectedCount,
  onArchive,
  onDelete,
  onStatusChange,
  onLabelChange,
  onEffortChange,
  onHorizonChange,
  onClearSelection,
  availableLabels = [],
}: BulkActionBarProps) {
  const { toast } = useToast();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);
  const [showHorizonMenu, setShowHorizonMenu] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAction = async (
    action: string,
    fn: () => Promise<void>,
    successMessage?: string
  ) => {
    setLoading(action);
    try {
      await fn();
      if (successMessage) {
        toast(successMessage, "success");
      }
    } catch (error) {
      toast("Operation failed. Please try again.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (status: IdeaStatus) => {
    setShowStatusMenu(false);
    await handleAction(
      `status-${status}`,
      () => onStatusChange(status),
      `Updated ${selectedCount} idea${selectedCount !== 1 ? "s" : ""} to ${STATUS_OPTIONS.find(s => s.value === status)?.label}`
    );
  };

  const handleLabelChange = async (labelId: string, action: "add" | "remove") => {
    if (!onLabelChange) return;
    setShowLabelMenu(false);
    const label = availableLabels.find(l => l.id === labelId);
    await handleAction(
      `label-${action}-${labelId}`,
      () => onLabelChange(labelId, action),
      `${action === "add" ? "Added" : "Removed"} "${label?.name || "label"}" ${action === "add" ? "to" : "from"} ${selectedCount} idea${selectedCount !== 1 ? "s" : ""}`
    );
  };

  const handleEffortChange = async (effort: EffortEstimate) => {
    if (!onEffortChange) return;
    setShowEffortMenu(false);
    await handleAction(
      `effort-${effort}`,
      () => onEffortChange(effort),
      `Set effort to ${EFFORT_OPTIONS.find(e => e.value === effort)?.label} for ${selectedCount} idea${selectedCount !== 1 ? "s" : ""}`
    );
  };

  const handleHorizonChange = async (horizon: PlanningHorizon) => {
    if (!onHorizonChange) return;
    setShowHorizonMenu(false);
    await handleAction(
      `horizon-${horizon}`,
      () => onHorizonChange(horizon),
      `Set horizon to ${HORIZON_OPTIONS.find(h => h.value === horizon)?.label} for ${selectedCount} idea${selectedCount !== 1 ? "s" : ""}`
    );
  };

  const handleArchive = async () => {
    await handleAction(
      "archive",
      onArchive,
      `Archived ${selectedCount} idea${selectedCount !== 1 ? "s" : ""}`
    );
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setConfirmDelete(false);
    await handleAction(
      "delete",
      onDelete,
      `Deleted ${selectedCount} idea${selectedCount !== 1 ? "s" : ""}`
    );
  };

  // Close all menus
  const closeAllMenus = () => {
    setShowStatusMenu(false);
    setShowLabelMenu(false);
    setShowEffortMenu(false);
    setShowHorizonMenu(false);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-elevated border border-border shadow-lg">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">selected</span>
        </div>

        {/* Status change dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            {loading?.startsWith("status") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span className="text-sm">Status</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover text-left"
                  >
                    <StatusBadge status={opt.value} size="sm" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Labels dropdown */}
        {onLabelChange && availableLabels.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                closeAllMenus();
                setShowLabelMenu(!showLabelMenu);
              }}
              disabled={loading !== null}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              {loading?.startsWith("label") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Tag className="h-4 w-4" />
              )}
              <span className="text-sm">Labels</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showLabelMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLabelMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                    Add Label
                  </div>
                  {availableLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelChange(label.id, "add")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover text-left"
                    >
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Effort dropdown */}
        {onEffortChange && (
          <div className="relative">
            <button
              onClick={() => {
                closeAllMenus();
                setShowEffortMenu(!showEffortMenu);
              }}
              disabled={loading !== null}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              {loading?.startsWith("effort") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Gauge className="h-4 w-4" />
              )}
              <span className="text-sm">Effort</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showEffortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEffortMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-40 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                  {EFFORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleEffortChange(opt.value)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover text-left"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Horizon dropdown */}
        {onHorizonChange && (
          <div className="relative">
            <button
              onClick={() => {
                closeAllMenus();
                setShowHorizonMenu(!showHorizonMenu);
              }}
              disabled={loading !== null}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              {loading?.startsWith("horizon") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="text-sm">Horizon</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showHorizonMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHorizonMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-40 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                  {HORIZON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value ?? "null"}
                      onClick={() => handleHorizonChange(opt.value)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover text-left"
                    >
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", opt.color)}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Archive button */}
        <button
          onClick={handleArchive}
          disabled={loading !== null}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
        >
          {loading === "archive" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          <span className="text-sm">Archive</span>
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={loading !== null}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50",
            confirmDelete
              ? "bg-error text-white hover:bg-error/90"
              : "hover:bg-bg-hover text-error"
          )}
        >
          {loading === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="text-sm">
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </span>
        </button>

        {/* Clear selection */}
        <button
          onClick={() => {
            setConfirmDelete(false);
            onClearSelection();
          }}
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-bg-hover transition-colors ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
