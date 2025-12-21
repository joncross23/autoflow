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
  Activity,
  Sparkles,
  MoreHorizontal,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { updateTask } from "@/lib/api/tasks";
import { getTaskLabels } from "@/lib/api/labels";
import { getTaskChecklists } from "@/lib/api/checklists";
import { getTaskAttachments } from "@/lib/api/attachments";
import { getTaskLinks } from "@/lib/api/links";
import type { DbTask } from "@/types/database";
import { LabelsSection } from "@/components/shared/LabelsSection";
import { ChecklistsSection } from "@/components/shared/ChecklistsSection";
import { AttachmentsSection } from "@/components/shared/AttachmentsSection";
import { LinksSection } from "@/components/shared/LinksSection";
import { AIAnalysisSection } from "@/components/shared/AIAnalysisSection";
import { ParentIdeaSection } from "@/components/shared/ParentIdeaSection";

interface TaskDetailModalProps {
  task: DbTask;
  ideaTitle?: string;
  isNew?: boolean; // When true, shows minimal UI for new cards
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
  onRemove,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
  onRemove?: () => void;
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
        <div className="flex items-center gap-2">
          {onAdd && isOpen && (
            <button
              onClick={onAdd}
              className="text-xs text-foreground-muted hover:text-primary transition-colors"
            >
              + {addLabel || "Add"}
            </button>
          )}
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
      ? "bg-bg-hover text-primary"
      : "text-foreground-secondary hover:bg-bg-hover hover:text-foreground",
    ai: active
      ? "bg-cyan-500/10 text-cyan-400"
      : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400",
    danger: "text-error hover:bg-error/10 hover:text-error",
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

// Enabled sections type
interface EnabledSections {
  labels: boolean;
  members: boolean;
  checklists: boolean;
  dates: boolean;
  aiSuggestions: boolean;
  attachments: boolean;
  links: boolean;
}

export function TaskDetailModal({
  task,
  ideaTitle,
  isNew = false,
  onClose,
  onSave,
  onDelete,
}: TaskDetailModalProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [ideaId, setIdeaId] = useState<string | null>(task.idea_id);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Track which sections are enabled (start minimal, populate based on data)
  const [enabledSections, setEnabledSections] = useState<EnabledSections>({
    labels: false,
    members: false, // Members not implemented yet
    checklists: false,
    dates: false,
    aiSuggestions: false,
    attachments: false,
    links: false,
  });
  const [sectionsLoaded, setSectionsLoaded] = useState(isNew);

  // On mount, check which sections have data and enable only those
  useEffect(() => {
    if (isNew) return; // New cards start with no sections

    async function loadSectionData() {
      try {
        const [labels, checklists, attachments, links] = await Promise.all([
          getTaskLabels(task.id),
          getTaskChecklists(task.id),
          getTaskAttachments(task.id),
          getTaskLinks(task.id),
        ]);

        setEnabledSections({
          labels: labels.length > 0,
          members: false,
          checklists: checklists.length > 0,
          dates: task.due_date != null,
          aiSuggestions: false, // AI is manual-trigger only
          attachments: attachments.length > 0,
          links: links.length > 0,
        });
      } catch (error) {
        console.error("Failed to load section data:", error);
      } finally {
        setSectionsLoaded(true);
      }
    }

    loadSectionData();
  }, [task.id, task.due_date, isNew]);

  // Enable a section (sidebar buttons only enable, × removes)
  const enableSection = (section: keyof EnabledSections) => {
    setEnabledSections((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  // Disable a section (used by × button)
  const disableSection = (section: keyof EnabledSections) => {
    setEnabledSections((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  // Track changes
  useEffect(() => {
    const changed =
      title !== task.title ||
      description !== (task.description || "") ||
      ideaId !== task.idea_id;
    setHasChanges(changed);
  }, [title, description, ideaId, task.title, task.description, task.idea_id]);

  // Save task
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);
      const updated = await updateTask(task.id, {
        title,
        description: description || null,
        idea_id: ideaId,
      });
      onSave(updated);
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setSaving(false);
    }
  }, [hasChanges, task.id, title, description, ideaId, onSave]);

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
      <div className="relative w-full md:w-1/2 md:min-w-[600px] md:max-w-[900px] md:my-8 md:mx-4 min-h-screen md:min-h-0">
        <div className="bg-bg-secondary md:rounded-xl overflow-hidden shadow-2xl md:border md:border-border min-h-screen md:min-h-0">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary sticky top-0 z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-lg hover:bg-bg-hover transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </button>
                )}
                <button
                  onClick={() => setShowMobileActions(!showMobileActions)}
                  className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop Close button - top right corner, prominent */}
          {!isMobile && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-bg-tertiary/80 hover:bg-bg-hover text-foreground-secondary hover:text-foreground transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 min-w-0 overflow-y-auto md:max-h-[80vh]">
              {/* Title - Editable (always at top) */}
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-foreground-muted"
                  placeholder="Card title"
                  autoFocus={isNew}
                />
              </div>

              {/* Parent Idea Selector */}
              <div className="mb-4">
                <ParentIdeaSection
                  ideaId={ideaId}
                  onIdeaChange={setIdeaId}
                />
              </div>

              {/* Status Row - Only show for existing cards */}
              {!isNew && (
                <div className="flex items-center gap-3 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    task.completed
                      ? "bg-success/20 text-success"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    {task.completed ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {task.completed ? "Complete" : "In Progress"}
                  </span>

                  {task.due_date && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      new Date(task.due_date) < new Date() && !task.completed
                        ? "bg-error/20 text-error"
                        : "bg-bg-tertiary text-foreground-muted"
                    }`}>
                      <Calendar className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              )}

              {/* Labels - Only if enabled */}
              {enabledSections.labels && (
                <LabelsSection
                  taskId={task.id}
                  onRemove={() => disableSection("labels")}
                />
              )}

              {/* Members - Placeholder, only if enabled */}
              {enabledSections.members && (
                <Section
                  icon={Users}
                  title="Members"
                  onRemove={() => disableSection("members")}
                >
                  <div className="text-sm text-foreground-muted">
                    No members assigned yet
                  </div>
                </Section>
              )}

              {/* Description - Always shown */}
              <Section icon={FileText} title="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={isNew ? 3 : 4}
                  className="w-full p-3 bg-bg-tertiary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a more detailed description..."
                />
              </Section>

              {/* Checklists - Only if enabled */}
              {enabledSections.checklists && (
                <ChecklistsSection
                  taskId={task.id}
                />
              )}

              {/* Dates - Only if enabled */}
              {enabledSections.dates && (
                <Section
                  icon={Calendar}
                  title="Dates"
                  onRemove={() => disableSection("dates")}
                >
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
              )}

              {/* AI Analysis - Only if enabled */}
              {enabledSections.aiSuggestions && (
                <AIAnalysisSection
                  taskId={task.id}
                  taskTitle={title}
                  taskDescription={description}
                />
              )}

              {/* Attachments - Only if enabled */}
              {enabledSections.attachments && (
                <AttachmentsSection taskId={task.id} />
              )}

              {/* Links - Only if enabled */}
              {enabledSections.links && (
                <LinksSection taskId={task.id} />
              )}

              {/* Activity - Only show for existing cards */}
              {!isNew && (
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
              )}
            </div>

            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:block w-48 p-4 bg-bg-tertiary shrink-0">
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
                    <SidebarButton
                      icon={Tag}
                      label="Labels"
                      active={enabledSections.labels}
                      onClick={() => enableSection("labels")}
                    />
                    <SidebarButton
                      icon={Users}
                      label="Members"
                      active={enabledSections.members}
                      onClick={() => enableSection("members")}
                    />
                    <SidebarButton
                      icon={CheckCircle2}
                      label="Checklist"
                      active={enabledSections.checklists}
                      onClick={() => enableSection("checklists")}
                    />
                    <SidebarButton
                      icon={Calendar}
                      label="Dates"
                      active={enabledSections.dates}
                      onClick={() => enableSection("dates")}
                    />
                    <SidebarButton
                      icon={Paperclip}
                      label="Attachment"
                      active={enabledSections.attachments}
                      onClick={() => enableSection("attachments")}
                    />
                    <SidebarButton
                      icon={LinkIcon}
                      label="Link"
                      active={enabledSections.links}
                      onClick={() => enableSection("links")}
                    />
                  </div>
                </div>

                {/* AI */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    AI
                  </div>
                  <div className="space-y-1">
                    <SidebarButton
                      icon={Sparkles}
                      label="Analyse"
                      variant="ai"
                      active={enabledSections.aiSuggestions}
                      onClick={() => enableSection("aiSuggestions")}
                    />
                  </div>
                </div>

                {/* Delete */}
                {onDelete && (
                  <div className="space-y-1">
                    <SidebarButton
                      icon={Trash2}
                      label="Delete"
                      variant="danger"
                      onClick={() => onDelete(task)}
                    />
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="mt-6 pt-4">
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

          {/* Mobile Actions Dropdown */}
          {isMobile && showMobileActions && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMobileActions(false)}
              />
              <div className="absolute top-14 right-4 z-30 w-48 bg-bg-elevated border border-border rounded-lg shadow-lg py-2">
                <div className="px-3 py-1 text-xs font-semibold text-foreground-muted uppercase">
                  Add to card
                </div>
                <button
                  onClick={() => { enableSection("labels"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.labels ? "text-primary" : ""}`}
                >
                  <Tag className="h-4 w-4" /> Labels
                </button>
                <button
                  onClick={() => { enableSection("members"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.members ? "text-primary" : ""}`}
                >
                  <Users className="h-4 w-4" /> Members
                </button>
                <button
                  onClick={() => { enableSection("checklists"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.checklists ? "text-primary" : ""}`}
                >
                  <CheckCircle2 className="h-4 w-4" /> Checklist
                </button>
                <button
                  onClick={() => { enableSection("dates"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.dates ? "text-primary" : ""}`}
                >
                  <Calendar className="h-4 w-4" /> Dates
                </button>
                <button
                  onClick={() => { enableSection("attachments"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.attachments ? "text-primary" : ""}`}
                >
                  <Paperclip className="h-4 w-4" /> Attachment
                </button>
                <button
                  onClick={() => { enableSection("links"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.links ? "text-primary" : ""}`}
                >
                  <LinkIcon className="h-4 w-4" /> Link
                </button>
                <div className="my-1 border-t border-border" />
                <div className="px-3 py-1 text-xs font-semibold text-foreground-muted uppercase">
                  AI
                </div>
                <button
                  onClick={() => { enableSection("aiSuggestions"); setShowMobileActions(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover ${enabledSections.aiSuggestions ? "text-cyan-400" : "text-cyan-400/70"}`}
                >
                  <Sparkles className="h-4 w-4" /> Analyse
                </button>
                {onDelete && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => onDelete(task)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
