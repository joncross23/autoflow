"use client";

import { X, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiEvaluationPanel } from "./AiEvaluationPanel";
import type { DbIdea, IdeaStatus, IdeaFrequency } from "@/types/database";

interface IdeaDetailModalProps {
  idea: DbIdea;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_COLORS: Record<IdeaStatus, string> = {
  new: "badge-primary",
  evaluating: "badge-warning",
  prioritised: "badge-info",
  converting: "badge-success",
  archived: "badge-default",
};

const FREQUENCY_LABELS: Record<IdeaFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  adhoc: "Ad-hoc",
};

export function IdeaDetailModal({
  idea,
  onClose,
  onEdit,
  onDelete,
}: IdeaDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-bg-elevated rounded-xl shadow-xl border border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{idea.title}</h2>
            <span className={cn("badge", STATUS_COLORS[idea.status])}>
              {idea.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded hover:bg-bg-hover"
              title="Edit idea"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded hover:bg-bg-hover text-error"
              title="Delete idea"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-bg-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr,320px] divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Idea Details */}
            <div className="p-4 space-y-6">
              {/* Description */}
              {idea.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{idea.description}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                {idea.frequency && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Frequency
                    </h4>
                    <p className="text-sm">{FREQUENCY_LABELS[idea.frequency]}</p>
                  </div>
                )}
                {idea.time_spent && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Time per Task
                    </h4>
                    <p className="text-sm">{idea.time_spent} minutes</p>
                  </div>
                )}
                {idea.owner && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Owner
                    </h4>
                    <p className="text-sm">{idea.owner}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Created
                  </h4>
                  <p className="text-sm">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Pain Points */}
              {idea.pain_points && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Pain Points
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{idea.pain_points}</p>
                </div>
              )}

              {/* Desired Outcome */}
              {idea.desired_outcome && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Desired Outcome
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{idea.desired_outcome}</p>
                </div>
              )}

              {/* Empty state if no details */}
              {!idea.description &&
                !idea.pain_points &&
                !idea.desired_outcome && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No additional details provided.
                    </p>
                    <button onClick={onEdit} className="btn btn-outline mt-4">
                      Add Details
                    </button>
                  </div>
                )}
            </div>

            {/* Right: AI Evaluation */}
            <div className="p-4 bg-bg-secondary">
              <AiEvaluationPanel ideaId={idea.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
