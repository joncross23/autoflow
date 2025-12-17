"use client";

import { MoreHorizontal, Edit2, Trash2, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { DbIdea, IdeaStatus } from "@/types/database";

interface IdeaCardProps {
  idea: DbIdea;
  onEdit: (idea: DbIdea) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; variant: "default" | "primary" | "success" | "warning" | "error" }> = {
  new: { label: "New", variant: "primary" },
  evaluating: { label: "Evaluating", variant: "warning" },
  prioritised: { label: "Prioritised", variant: "success" },
  converting: { label: "Converting", variant: "default" },
  archived: { label: "Archived", variant: "default" },
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  adhoc: "Ad-hoc",
};

export function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusConfig = STATUS_CONFIG[idea.status];

  return (
    <div className="card group relative">
      {/* Status badge */}
      <div className="mb-3 flex items-center justify-between">
        <Badge variant={statusConfig.variant} size="sm">
          {statusConfig.label}
        </Badge>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-bg-hover opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-border bg-bg-elevated shadow-lg">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(idea);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(idea.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-bg-hover"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold mb-2 line-clamp-2">{idea.title}</h3>

      {/* Description */}
      {idea.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {idea.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {idea.frequency && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {FREQUENCY_LABELS[idea.frequency]}
          </div>
        )}
        {idea.time_spent && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {idea.time_spent} min/task
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatRelativeTime(idea.created_at)}
        </div>
      </div>
    </div>
  );
}
