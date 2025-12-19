"use client";

import { useState } from "react";
import { Archive, Trash2, Check, X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { IdeaStatus } from "@/types/database";

interface BulkActionBarProps {
  selectedCount: number;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
  onStatusChange: (status: IdeaStatus) => Promise<void>;
  onClearSelection: () => void;
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

export function BulkActionBar({
  selectedCount,
  onArchive,
  onDelete,
  onStatusChange,
  onClearSelection,
}: BulkActionBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAction = async (
    action: string,
    fn: () => Promise<void>
  ) => {
    setLoading(action);
    try {
      await fn();
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (status: IdeaStatus) => {
    setShowStatusMenu(false);
    await handleAction(`status-${status}`, () => onStatusChange(status));
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setConfirmDelete(false);
    await handleAction("delete", onDelete);
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

        {/* Archive button */}
        <button
          onClick={() => handleAction("archive", onArchive)}
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
