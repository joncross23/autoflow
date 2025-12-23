"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Calendar,
  Clock,
  User,
  Tag,
  MoreVertical,
  Copy,
  Archive,
  Paperclip,
  Link2,
  Brain,
  MessageSquare,
  Activity,
  ListTodo,
  CheckSquare,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useToast } from "@/hooks/useToast";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { AiEvaluationPanel } from "./AiEvaluationPanel";
import { RiceScorePanel } from "./RiceScorePanel";
import { StatusBadge, STATUS_CONFIG } from "./StatusBadge";
import { IdeaTasksSection } from "./IdeaTasksSection";
import { CommentsSection } from "./CommentsSection";
import { ActivityLog } from "./ActivityLog";
import { LabelsSection } from "@/components/shared/LabelsSection";
import { ChecklistsSection } from "@/components/shared/ChecklistsSection";
import { AttachmentsSection } from "@/components/shared/AttachmentsSection";
import { LinksSection } from "@/components/shared/LinksSection";
import { updateIdea, updateIdeaStatus, deleteIdea } from "@/lib/api/ideas";
import type { DbIdea, IdeaStatus, EffortEstimate, PlanningHorizon } from "@/types/database";

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

const HORIZON_OPTIONS: { value: PlanningHorizon; label: string; color: string }[] = [
  { value: "now", label: "Now", color: "bg-green-500/10 text-green-500" },
  { value: "next", label: "Next", color: "bg-blue-500/10 text-blue-500" },
  { value: "later", label: "Later", color: "bg-slate-500/10 text-slate-500" },
  { value: null, label: "Unplanned", color: "text-muted-foreground" },
];

export function IdeaDetailSlider({
  idea,
  onClose,
  onUpdate,
  onDelete,
}: IdeaDetailSliderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description || "");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);
  const [showHorizonMenu, setShowHorizonMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  }, [onClose]);

  // Focus trap for accessibility - trap focus within slider when open
  const sliderRef = useFocusTrap<HTMLDivElement>({
    enabled: true,
    returnFocusOnDeactivate: true,
    onEscape: handleClose,
  });

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
      toast("Title updated", "success");
    } catch (error) {
      console.error("Failed to save title:", error);
      setTitle(idea.title);
      toast("Failed to save title", "error");
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
      toast("Description updated", "success");
    } catch (error) {
      console.error("Failed to save description:", error);
      setDescription(idea.description || "");
      toast("Failed to save description", "error");
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
      toast(`Status changed to ${STATUS_OPTIONS.find(s => s.value === status)?.label}`, "success");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast("Failed to update status", "error");
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
      toast("Effort updated", "success");
    } catch (error) {
      console.error("Failed to update effort:", error);
      toast("Failed to update effort", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleHorizonChange = async (horizon: PlanningHorizon) => {
    setShowHorizonMenu(false);
    setSaving(true);
    try {
      const updated = await updateIdea(idea.id, { horizon });
      onUpdate(updated);
      toast("Horizon updated", "success");
    } catch (error) {
      console.error("Failed to update horizon:", error);
      toast("Failed to update horizon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowMoreMenu(false);
    if (!confirm("Are you sure you want to delete this idea? This cannot be undone.")) return;

    try {
      await deleteIdea(idea.id);
      toast("Idea deleted", "success");
      onDelete(idea.id);
      handleClose();
    } catch (error) {
      console.error("Failed to delete idea:", error);
      toast("Failed to delete idea", "error");
    }
  };

  const handleDuplicate = () => {
    setShowMoreMenu(false);
    toast("Duplicate feature coming soon", "info");
  };

  const handleArchive = () => {
    setShowMoreMenu(false);
    toast("Archive feature coming soon", "info");
  };

  const handleAcceptIdea = async () => {
    if (idea.status === "accepted" || idea.status === "doing") {
      router.push("/dashboard/tasks");
      handleClose();
      return;
    }

    setConverting(true);
    try {
      // Update status to "accepted" to move to task board
      const updated = await updateIdeaStatus(idea.id, "accepted");
      onUpdate(updated);
      router.push("/dashboard/tasks");
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
        ref={sliderRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slider-title"
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 bg-bg-elevated border-l border-border shadow-2xl transition-transform duration-200 ease-out flex flex-col",
          // Full-screen on mobile, half-width on desktop
          "w-full md:w-1/2 md:min-w-[500px] md:max-w-[1000px]",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Compact Header - Title, Status, Actions on one row */}
        <div className="px-4 py-3 md:px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {/* Back button on mobile */}
            {isMobile && (
              <button
                onClick={handleClose}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-bg-hover transition-colors shrink-0"
                title="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Title - takes remaining space */}
            <div className="flex-1 min-w-0">
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
                  className="input w-full text-base font-semibold py-1"
                  autoFocus
                />
              ) : (
                <h1
                  id="slider-title"
                  onClick={() => setEditingTitle(true)}
                  className="text-base font-semibold cursor-text hover:bg-bg-hover rounded px-2 py-1 -mx-2 transition-colors truncate"
                  title={idea.title}
                >
                  {idea.title}
                </h1>
              )}
            </div>

            {/* Status dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-1 hover:bg-bg-hover rounded-md p-1 transition-colors"
                disabled={saving}
              >
                <StatusBadge status={idea.status} size="sm" />
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
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

            {/* Saving indicator */}
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}

            {/* More actions menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 rounded hover:bg-bg-hover transition-colors"
                title="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                    <button
                      onClick={handleDuplicate}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-bg-hover transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={handleArchive}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-bg-hover transition-colors"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Close button - desktop only */}
            <button
              onClick={handleClose}
              className="hidden md:block p-1.5 rounded hover:bg-bg-hover transition-colors shrink-0"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 md:p-6 md:space-y-6">
            {/* View Tasks / Accept Button - Prominent placement */}
            {idea.status !== "parked" &&
              idea.status !== "dropped" &&
              idea.status !== "complete" && (
                <button
                  onClick={handleAcceptIdea}
                  disabled={converting}
                  className={cn(
                    "btn w-full sm:w-auto",
                    idea.status === "accepted" || idea.status === "doing"
                      ? "btn-outline"
                      : "btn-primary"
                  )}
                >
                  {converting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {idea.status === "accepted" || idea.status === "doing"
                        ? "View Tasks"
                        : "Accept & Start"}
                    </>
                  )}
                </button>
              )}

            {/* Labels */}
            <LabelsSection ideaId={idea.id} />

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

            {/* Tasks Section - Collapsible, open by default for active ideas */}
            <CollapsibleSection
              title="Tasks"
              icon={<ListTodo className="h-4 w-4" />}
              defaultOpen={idea.status === "accepted" || idea.status === "doing"}
              showBorder={true}
            >
              <IdeaTasksSection ideaId={idea.id} ideaTitle={idea.title} />
            </CollapsibleSection>

            {/* Checklists - Collapsible, closed by default */}
            <CollapsibleSection
              title="Checklists"
              icon={<CheckSquare className="h-4 w-4" />}
              defaultOpen={false}
            >
              <ChecklistsSection ideaId={idea.id} hideHeader />
            </CollapsibleSection>

            {/* Attachments - Collapsible, closed by default */}
            <CollapsibleSection
              title="Attachments"
              icon={<Paperclip className="h-4 w-4" />}
              defaultOpen={false}
            >
              <AttachmentsSection ideaId={idea.id} hideHeader />
            </CollapsibleSection>

            {/* Links (includes Backlinks) - Collapsible, closed by default */}
            <CollapsibleSection
              title="Links"
              icon={<Link2 className="h-4 w-4" />}
              defaultOpen={false}
            >
              <LinksSection ideaId={idea.id} hideHeader />
            </CollapsibleSection>

            {/* AI Evaluation - Collapsible, closed by default */}
            <CollapsibleSection
              title="AI Evaluation"
              icon={<Brain className="h-4 w-4" />}
              defaultOpen={false}
            >
              <AiEvaluationPanel ideaId={idea.id} hideHeader />
            </CollapsibleSection>

            {/* RICE Score - Collapsible, closed by default */}
            <CollapsibleSection
              title="RICE Score"
              defaultOpen={false}
            >
              <RiceScorePanel idea={idea} onUpdate={onUpdate} />
            </CollapsibleSection>

            {/* Compact Metadata Row */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {/* Effort */}
                <div className="relative flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <button
                    onClick={() => setShowEffortMenu(!showEffortMenu)}
                    className="hover:text-text transition-colors"
                  >
                    {idea.effort_estimate
                      ? EFFORT_OPTIONS.find((e) => e.value === idea.effort_estimate)?.label.split(" ")[0]
                      : "Effort?"}
                  </button>
                  {showEffortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowEffortMenu(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-1 w-48 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
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

                <span className="text-border">·</span>

                {/* Horizon */}
                <div className="relative flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <button
                    onClick={() => setShowHorizonMenu(!showHorizonMenu)}
                    className={cn(
                      "hover:opacity-80 transition-opacity",
                      idea.horizon
                        ? HORIZON_OPTIONS.find((h) => h.value === idea.horizon)?.color
                        : ""
                    )}
                  >
                    {idea.horizon
                      ? HORIZON_OPTIONS.find((h) => h.value === idea.horizon)?.label
                      : "Horizon?"}
                  </button>
                  {showHorizonMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowHorizonMenu(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-1 w-36 rounded-lg border border-border bg-bg-elevated shadow-lg z-20 py-1">
                        {HORIZON_OPTIONS.map((opt) => (
                          <button
                            key={opt.value ?? "null"}
                            onClick={() => handleHorizonChange(opt.value)}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left transition-colors flex items-center gap-2",
                              opt.value === idea.horizon
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-bg-hover"
                            )}
                          >
                            <span className={cn("text-xs font-medium", opt.color)}>
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <span className="text-border">·</span>

                {/* Owner */}
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{idea.owner || "Unassigned"}</span>
                </div>

                <span className="text-border">·</span>

                {/* Created */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(idea.created_at)}</span>
                </div>

                <span className="text-border">·</span>

                {/* Updated */}
                <span>Updated {formatRelativeTime(idea.updated_at)}</span>

                {/* Started */}
                {idea.started_at && (
                  <>
                    <span className="text-border">·</span>
                    <span>Started {formatDate(idea.started_at)}</span>
                  </>
                )}

                {/* Completed */}
                {idea.completed_at && (
                  <>
                    <span className="text-border">·</span>
                    <span>Completed {formatDate(idea.completed_at)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Activity Log - Collapsible, closed by default */}
            <CollapsibleSection
              title="Activity"
              icon={<Activity className="h-4 w-4" />}
              defaultOpen={false}
            >
              <ActivityLog ideaId={idea.id} maxItems={5} />
            </CollapsibleSection>

            {/* Comments - Collapsible, closed by default */}
            <CollapsibleSection
              title="Comments"
              icon={<MessageSquare className="h-4 w-4" />}
              defaultOpen={false}
            >
              <CommentsSection ideaId={idea.id} />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </>
  );
}
