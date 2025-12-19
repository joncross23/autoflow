"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Pencil,
  Trash2,
  ArrowRight,
  Loader2,
  ChevronDown,
  Calendar,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { AiEvaluationPanel } from "./AiEvaluationPanel";
import { StatusBadge, STATUS_CONFIG } from "./StatusBadge";
import { IdeaTasksSection } from "./IdeaTasksSection";
import { updateIdea, updateIdeaStatus, deleteIdea } from "@/lib/api/ideas";
import type { DbIdea, IdeaStatus, EffortEstimate } from "@/types/database";

interface IdeaDetailSliderProps {
  idea: DbIdea;
  onClose: () => void;
  onUpdate: (idea: DbIdea) => void;
  onDelete: (id: string) => void;
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
  { value: "trivial", label: "Trivial (< 1 hour)" },
  { value: "small", label: "Small (1-4 hours)" },
  { value: "medium", label: "Medium (1-2 days)" },
  { value: "large", label: "Large (3-5 days)" },
  { value: "xlarge", label: "X-Large (1+ weeks)" },
];

export function IdeaDetailSlider({
  idea,
  onClose,
  onUpdate,
  onDelete,
}: IdeaDetailSliderProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description || "");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  }, [onClose]);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const handleSaveTitle = async () => {
    if (title.trim() === idea.title) {
      setEditingTitle(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateIdea(idea.id, { title: title.trim() });
      onUpdate(updated);
      setEditingTitle(false);
    } catch (error) {
      console.error("Failed to save title:", error);
      setTitle(idea.title);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    if (description === (idea.description || "")) {
      setEditingDescription(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateIdea(idea.id, {
        description: description || null,
      });
      onUpdate(updated);
      setEditingDescription(false);
    } catch (error) {
      console.error("Failed to save description:", error);
      setDescription(idea.description || "");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: IdeaStatus) => {
    setShowStatusMenu(false);
    setSaving(true);
    try {
      const updated = await updateIdeaStatus(idea.id, status);
      onUpdate(updated);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEffortChange = async (effort: EffortEstimate) => {
    setShowEffortMenu(false);
    setSaving(true);
    try {
      const updated = await updateIdea(idea.id, { effort_estimate: effort });
      onUpdate(updated);
    } catch (error) {
      console.error("Failed to update effort:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this idea?")) return;

    try {
      await deleteIdea(idea.id);
      onDelete(idea.id);
      handleClose();
    } catch (error) {
      console.error("Failed to delete idea:", error);
    }
  };

  const handleAcceptIdea = async () => {
    if (idea.status === "accepted" || idea.status === "doing") {
      router.push("/dashboard/delivery");
      handleClose();
      return;
    }

    setConverting(true);
    try {
      // Update status to "accepted" to move to delivery board
      const updated = await updateIdeaStatus(idea.id, "accepted");
      onUpdate(updated);
      router.push("/dashboard/delivery");
      handleClose();
    } catch (error) {
      console.error("Failed to accept idea:", error);
      setConverting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Slider Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-bg-elevated border-l border-border shadow-2xl transition-transform duration-200 ease-out flex flex-col",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-1 hover:bg-bg-hover rounded-md p-1 transition-colors"
                disabled={saving}
              >
                <StatusBadge status={idea.status} />
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                          opt.value === idea.status
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-bg-hover"
                        )}
                      >
                        <StatusBadge status={opt.value} size="sm" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {saving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Action buttons */}
            {idea.status !== "parked" &&
              idea.status !== "dropped" &&
              idea.status !== "complete" && (
                <button
                  onClick={handleAcceptIdea}
                  disabled={converting}
                  className={cn(
                    "btn btn-sm",
                    idea.status === "accepted" || idea.status === "doing"
                      ? "btn-outline"
                      : "btn-primary"
                  )}
                >
                  {converting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-1" />
                      {idea.status === "accepted" || idea.status === "doing"
                        ? "View Tasks"
                        : "Accept"}
                    </>
                  )}
                </button>
              )}

            <button
              onClick={handleDelete}
              className="p-2 rounded hover:bg-bg-hover text-error transition-colors"
              title="Delete idea"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-bg-hover transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              {editingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setTitle(idea.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="input w-full text-xl font-semibold"
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => setEditingTitle(true)}
                  className="text-xl font-semibold cursor-text hover:bg-bg-hover rounded px-2 py-1 -mx-2 transition-colors"
                >
                  {idea.title}
                </h1>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Effort Estimate */}
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Effort</span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowEffortMenu(!showEffortMenu)}
                    className="flex items-center gap-1 text-sm hover:bg-bg-hover rounded px-2 py-1 -mx-2 transition-colors"
                  >
                    {idea.effort_estimate
                      ? EFFORT_OPTIONS.find((e) => e.value === idea.effort_estimate)?.label
                      : "Not set"}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>

                  {showEffortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowEffortMenu(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                        {EFFORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleEffortChange(opt.value)}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left transition-colors",
                              opt.value === idea.effort_estimate
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-bg-hover"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Owner */}
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Owner</span>
                </div>
                <span>{idea.owner || "Unassigned"}</span>
              </div>

              {/* Created */}
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Created</span>
                </div>
                <span>{formatDate(idea.created_at)}</span>
              </div>

              {/* Updated */}
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Updated</span>
                </div>
                <span>{formatRelativeTime(idea.updated_at)}</span>
              </div>

              {/* Started */}
              {idea.started_at && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Started</span>
                  </div>
                  <span>{formatDate(idea.started_at)}</span>
                </div>
              )}

              {/* Completed */}
              {idea.completed_at && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                  <span>{formatDate(idea.completed_at)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              {editingDescription ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setDescription(idea.description || "");
                      setEditingDescription(false);
                    }
                  }}
                  className="input w-full min-h-[120px] resize-y"
                  placeholder="Add a description..."
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setEditingDescription(true)}
                  className={cn(
                    "min-h-[80px] cursor-text rounded-lg border border-transparent hover:border-border hover:bg-bg-hover px-3 py-2 -mx-3 transition-colors",
                    !description && "text-muted-foreground"
                  )}
                >
                  {description ? (
                    <p className="whitespace-pre-wrap">{description}</p>
                  ) : (
                    <p>Click to add a description...</p>
                  )}
                </div>
              )}
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
                <p className="text-sm whitespace-pre-wrap">
                  {idea.desired_outcome}
                </p>
              </div>
            )}

            {/* Tasks Section */}
            {(idea.status === "accepted" || idea.status === "doing") && (
              <IdeaTasksSection ideaId={idea.id} />
            )}

            {/* AI Evaluation */}
            <div className="pt-4 border-t border-border">
              <AiEvaluationPanel ideaId={idea.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
