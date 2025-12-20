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
  MessageSquare,
  Activity,
  Sparkles,
  Move,
  Copy,
  Eye,
  Archive,
  Share2,
  Plus,
  MoreHorizontal,
  ExternalLink,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";
import { updateTask } from "@/lib/api/tasks";
import type { DbTask } from "@/types/database";
import { LabelsSection } from "@/components/shared/LabelsSection";
import { ChecklistsSection } from "@/components/shared/ChecklistsSection";
import { AttachmentsSection } from "@/components/shared/AttachmentsSection";
import { LinksSection } from "@/components/shared/LinksSection";
import { AISuggestionsSection } from "@/components/shared/AISuggestionsSection";

interface TaskDetailModalProps {
  task: DbTask;
  ideaTitle?: string;  // Parent idea title for badge
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
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
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
        {onAdd && isOpen && (
          <button
            onClick={onAdd}
            className="text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            + {addLabel || "Add"}
          </button>
        )}
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
      ? "bg-primary/20 text-primary"
      : "bg-bg-tertiary hover:bg-bg-hover text-foreground-secondary hover:text-foreground",
    ai: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
    danger: "bg-error/10 text-error hover:bg-error/20",
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

export function TaskDetailModal({
  task,
  ideaTitle,
  onClose,
  onSave,
  onDelete,
}: TaskDetailModalProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Track changes
  useEffect(() => {
    const changed = title !== task.title || description !== (task.description || "");
    setHasChanges(changed);
  }, [title, description, task.title, task.description]);

  // Save task
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);
      const updated = await updateTask(task.id, {
        title,
        description: description || null,
      });
      onSave(updated);
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setSaving(false);
    }
  }, [hasChanges, task.id, title, description, onSave]);

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

          {/* Desktop Close button */}
          {!isMobile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover text-foreground-muted hover:text-foreground transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 min-w-0 overflow-y-auto md:max-h-[80vh]">
              {/* Parent Idea Badge */}
              {ideaTitle && task.idea_id && (
                <Link
                  href={`/dashboard/ideas?selected=${task.idea_id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  {ideaTitle}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}

              {/* Header */}
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-foreground-muted"
                  placeholder="Task title"
                />
              </div>

              {/* Status Row */}
              <div className="flex items-center gap-3 mb-6">
                {/* Status badge */}
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

                {/* Due date if exists */}
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

              {/* Labels */}
              <LabelsSection taskId={task.id} />

              {/* Dates - Placeholder */}
              <Section icon={Calendar} title="Dates">
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

              {/* Description */}
              <Section icon={MoreHorizontal} title="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-bg-tertiary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a more detailed description..."
                />
              </Section>

              {/* Checklists */}
              <ChecklistsSection taskId={task.id} />

              {/* AI Suggestions */}
              <AISuggestionsSection
                taskId={task.id}
                taskTitle={title}
                taskDescription={description}
              />

              {/* Attachments */}
              <AttachmentsSection taskId={task.id} />

              {/* Links */}
              <LinksSection taskId={task.id} />

              {/* Activity */}
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
            </div>

            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:block w-48 p-4 bg-bg-tertiary border-l border-border shrink-0">
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
                    <SidebarButton icon={Users} label="Members" />
                    <SidebarButton icon={Tag} label="Labels" />
                    <SidebarButton icon={CheckCircle2} label="Checklist" />
                    <SidebarButton icon={Calendar} label="Dates" />
                    <SidebarButton icon={Paperclip} label="Attachment" />
                    <SidebarButton icon={LinkIcon} label="Link" />
                  </div>
                </div>

                {/* AI */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    AI
                  </div>
                  <div className="space-y-1">
                    <SidebarButton icon={Sparkles} label="Analyse" variant="ai" />
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    Actions
                  </div>
                  <div className="space-y-1">
                    <SidebarButton icon={Move} label="Move" />
                    <SidebarButton icon={Copy} label="Copy" />
                    <SidebarButton icon={Eye} label="Watch" />
                    <SidebarButton icon={Archive} label="Archive" />
                    <SidebarButton icon={Share2} label="Share" />
                  </div>
                </div>

                {/* Danger zone */}
                {onDelete && (
                  <div>
                    <div className="space-y-1">
                      <SidebarButton
                        icon={Trash2}
                        label="Delete"
                        variant="danger"
                        onClick={() => onDelete(task)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="mt-6 pt-4 border-t border-border">
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
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover">
                  <Users className="h-4 w-4" /> Members
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover">
                  <Tag className="h-4 w-4" /> Labels
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover">
                  <CheckCircle2 className="h-4 w-4" /> Checklist
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover">
                  <Paperclip className="h-4 w-4" /> Attachment
                </button>
                <div className="my-1 border-t border-border" />
                <div className="px-3 py-1 text-xs font-semibold text-foreground-muted uppercase">
                  Actions
                </div>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-hover">
                  <Archive className="h-4 w-4" /> Archive
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(task)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
