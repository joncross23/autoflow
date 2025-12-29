"use client";

/**
 * LinksSection Component
 * Unified linking for ideas, tasks, and external URLs
 * V1.3: Rich Cards feature
 * V1.4: Enhanced linking (Phase 3)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Pencil,
  Check,
  X,
  ListTodo,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getIdeaLinks,
  getTaskLinks,
  createIdeaLink,
  createTaskLink,
  updateLink,
  deleteLink,
  extractDomain,
  isValidUrl,
  normaliseUrl,
  LINK_FAVICONS,
} from "@/lib/api/links";
import { getAllTasks } from "@/lib/api/tasks";
import type { DbLink, DbTask, LinkRelationshipType } from "@/types/database";
import { RELATIONSHIP_TYPE_OPTIONS, RELATIONSHIP_TYPE_LABELS } from "@/types/database";
import { BacklinksSection } from "./BacklinksSection";

// Link type for creating new links (idea linking moved to ParentIdeaSection)
type LinkType = "url" | "task";

// Display type includes "idea" to render existing idea:// links from database
type DisplayLinkType = "url" | "task" | "idea";

// Internal link prefixes
const IDEA_PREFIX = "idea://";
const TASK_PREFIX = "task://";

interface LinksSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when links change */
  onLinksChange?: (count: number) => void;
  /** Hide the section header (when wrapped in CollapsibleSection) */
  hideHeader?: boolean;
}

// Helper to detect link type from URL (for displaying existing links)
function detectLinkType(url: string): DisplayLinkType {
  if (url.startsWith(IDEA_PREFIX)) return "idea";
  if (url.startsWith(TASK_PREFIX)) return "task";
  return "url";
}

// Helper to extract ID from internal link
function extractInternalId(url: string): string | null {
  if (url.startsWith(IDEA_PREFIX)) return url.slice(IDEA_PREFIX.length);
  if (url.startsWith(TASK_PREFIX)) return url.slice(TASK_PREFIX.length);
  return null;
}

export function LinksSection({
  ideaId,
  taskId,
  className,
  hideHeader = false,
  onLinksChange,
}: LinksSectionProps) {
  const [links, setLinks] = useState<DbLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [linkType, setLinkType] = useState<LinkType>("url");
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFavicon, setNewFavicon] = useState("🔗");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // For task search
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DbTask | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [relationshipType, setRelationshipType] = useState<LinkRelationshipType>("related");
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);

  // Load links function wrapped in useCallback
  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: DbLink[] = [];
      if (ideaId) {
        data = await getIdeaLinks(ideaId);
      } else if (taskId) {
        data = await getTaskLinks(taskId);
      }
      setLinks(data);
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setIsLoading(false);
    }
  }, [ideaId, taskId]);

  // Load tasks function wrapped in useCallback
  const loadTasks = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const data = await getAllTasks();
      // Filter out current task if linking from a task
      setTasks(taskId ? data.filter((t) => t.id !== taskId) : data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoadingItems(false);
    }
  }, [taskId]);

  // Load links on mount
  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // Update callback when links change
  useEffect(() => {
    onLinksChange?.(links.length);
  }, [links, onLinksChange]);

  // Load tasks when link type changes
  useEffect(() => {
    if (linkType === "task") {
      loadTasks();
    }
  }, [linkType, loadTasks]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (relationshipDropdownRef.current && !relationshipDropdownRef.current.contains(event.target as Node)) {
        setShowRelationshipDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function resetForm() {
    setLinkType("url");
    setNewUrl("");
    setNewTitle("");
    setNewFavicon("🔗");
    setSearchQuery("");
    setSelectedItem(null);
    setShowDropdown(false);
    setRelationshipType("related");
    setShowRelationshipDropdown(false);
    setError(null);
  }

  async function handleAddLink() {
    setError(null);

    // For URL type
    if (linkType === "url") {
      if (!newUrl.trim()) return;

      const normalised = normaliseUrl(newUrl.trim());
      if (!isValidUrl(normalised)) {
        setError("Please enter a valid URL");
        return;
      }

      setIsAdding(true);
      try {
        let link: DbLink;
        const linkData = {
          url: normalised,
          title: newTitle.trim() || null,
          favicon: newFavicon,
        };

        if (ideaId) {
          link = await createIdeaLink(ideaId, linkData);
        } else if (taskId) {
          link = await createTaskLink(taskId, linkData);
        } else {
          return;
        }

        setLinks([link, ...links]);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding link:", error);
        setError("Failed to add link");
      } finally {
        setIsAdding(false);
      }
      return;
    }

    // For task type
    if (!selectedItem) {
      setError("Please select a task");
      return;
    }

    setIsAdding(true);
    try {
      const internalUrl = `${TASK_PREFIX}${selectedItem.id}`;

      let link: DbLink;
      const linkData = {
        url: internalUrl,
        title: selectedItem.title,
        favicon: "📋",
        relationship_type: relationshipType,
      };

      if (ideaId) {
        link = await createIdeaLink(ideaId, linkData);
      } else if (taskId) {
        link = await createTaskLink(taskId, linkData);
      } else {
        return;
      }

      setLinks([link, ...links]);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding link:", error);
      setError("Failed to add link");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteLink(linkId: string) {
    try {
      await deleteLink(linkId);
      setLinks(links.filter((l) => l.id !== linkId));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  }

  async function handleUpdateLink(linkId: string, updates: { title?: string; favicon?: string }) {
    try {
      const updated = await updateLink(linkId, updates);
      setLinks(links.map((l) => (l.id === linkId ? updated : l)));
    } catch (error) {
      console.error("Error updating link:", error);
    }
  }

  // Filter tasks by search query
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header - hidden when wrapped in CollapsibleSection */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2 className="w-4 h-4 text-foreground-muted" />
            Links
            {links.length > 0 && (
              <span className="text-xs text-foreground-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {links.length}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="px-2.5 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      )}

      {/* Add Button - shown when header is hidden */}
      {hideHeader && !showAddForm && (
        <button
          onClick={() => {
            setShowAddForm(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="w-full px-3 py-2 text-xs font-medium text-foreground-muted hover:text-foreground border border-dashed border-border rounded-lg hover:border-primary hover:bg-bg-hover flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Link
        </button>
      )}

      {/* Add Link Form */}
      {showAddForm && (
        <div className="p-3 bg-bg-tertiary/50 rounded-lg space-y-3">
          {error && <div className="text-xs text-error">{error}</div>}

          {/* Link Type Selector */}
          <div className="flex gap-1 p-1 bg-bg-tertiary rounded-lg">
            {(["url", "task"] as LinkType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setLinkType(type);
                  setSelectedItem(null);
                  setSearchQuery("");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                  linkType === type
                    ? "bg-primary text-white"
                    : "text-foreground-muted hover:text-foreground hover:bg-bg-hover"
                )}
              >
                {type === "url" && <Link2 className="w-3 h-3" />}
                {type === "task" && <ListTodo className="w-3 h-3" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {linkType === "url" && (
            <>
              <input
                ref={inputRef}
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddLink();
                  if (e.key === "Escape") {
                    setShowAddForm(false);
                    resetForm();
                  }
                }}
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {/* Favicon picker */}
              <div>
                <div className="text-xs text-foreground-muted mb-2">Icon</div>
                <div className="flex flex-wrap gap-1">
                  {LINK_FAVICONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewFavicon(emoji)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded text-lg transition-colors",
                        newFavicon === emoji
                          ? "bg-primary/20 ring-1 ring-primary"
                          : "hover:bg-bg-hover"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Task Selector */}
          {linkType === "task" && (
            <div className="relative" ref={dropdownRef}>
              {/* Search Input */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 bg-bg-tertiary border rounded cursor-pointer",
                  showDropdown ? "border-primary ring-1 ring-primary" : "border-border"
                )}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedItem ? (
                  <div className="flex items-center gap-2 flex-1">
                    <ListTodo className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-foreground truncate">
                      {selectedItem.title}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-foreground-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(true);
                      }}
                      placeholder="Search tasks..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                    />
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-foreground-muted transition-transform",
                    showDropdown && "rotate-180"
                  )}
                />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-hidden flex flex-col">
                  {/* Sticky search input at top of dropdown */}
                  <div className="p-2 border-b border-border shrink-0">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-tertiary rounded">
                      <Search className="w-4 h-4 text-foreground-muted shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-foreground-muted hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Results list */}
                  <div className="overflow-y-auto flex-1">
                  {isLoadingItems ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-foreground-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-foreground-muted">
                      {searchQuery ? `No tasks match "${searchQuery}"` : "No tasks available"}
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedItem(task);
                          setShowDropdown(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover transition-colors"
                      >
                        <ListTodo className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </button>
                    ))
                  )}
                  </div>
                </div>
              )}

              {/* Clear selection button */}
              {selectedItem && (
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Relationship Type Selector (only for task-to-task links) */}
          {linkType === "task" && taskId && (
            <div className="relative" ref={relationshipDropdownRef}>
              <div className="text-xs text-foreground-muted mb-1.5">Relationship</div>
              <button
                onClick={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm bg-bg-tertiary border rounded transition-colors",
                  showRelationshipDropdown ? "border-primary ring-1 ring-primary" : "border-border"
                )}
              >
                <span className="text-foreground">
                  {RELATIONSHIP_TYPE_LABELS[relationshipType]}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-foreground-muted transition-transform",
                    showRelationshipDropdown && "rotate-180"
                  )}
                />
              </button>
              {showRelationshipDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {RELATIONSHIP_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRelationshipType(option.value);
                        setShowRelationshipDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left hover:bg-bg-hover transition-colors",
                        relationshipType === option.value && "bg-primary/10 text-primary"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLink}
              disabled={
                isAdding ||
                (linkType === "url" && !newUrl.trim()) ||
                (linkType === "task" && !selectedItem)
              }
              className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add Link"}
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {isLoading ? (
        <div className="text-xs text-foreground-muted">Loading...</div>
      ) : links.length === 0 && !showAddForm ? (
        <div className="text-xs text-foreground-muted">No links</div>
      ) : (
        <div className="space-y-1">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              onDelete={() => handleDeleteLink(link.id)}
              onUpdate={(updates) => handleUpdateLink(link.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Backlinks Section - shows links that point TO this idea/task */}
      <BacklinksSection ideaId={ideaId} taskId={taskId} className="mt-4 pt-4 border-t border-border" />
    </div>
  );
}

// ============================================
// Link Row Component
// ============================================

interface LinkRowProps {
  link: DbLink;
  onDelete: () => void;
  onUpdate: (updates: { title?: string; favicon?: string }) => void;
}

function LinkRow({ link, onDelete, onUpdate }: LinkRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title || "");

  const linkType = detectLinkType(link.url);
  const internalId = extractInternalId(link.url);

  // For external URLs
  const domain = linkType === "url" ? extractDomain(link.url) : null;
  const displayTitle = link.title || domain || link.url;

  function handleSaveEdit() {
    onUpdate({ title: editTitle.trim() || undefined });
    setIsEditing(false);
  }

  // Internal link navigation path
  const internalPath =
    linkType === "idea"
      ? `/dashboard/ideas?selected=${internalId}`
      : linkType === "task"
      ? `/dashboard/projects?task=${internalId}`
      : null;

  return (
    <div className="flex items-start gap-3 px-3 py-2 bg-bg-tertiary/50 rounded-lg group hover:bg-bg-tertiary">
      <span className="text-lg mt-0.5">{link.favicon || "🔗"}</span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditTitle(link.title || "");
                }
              }}
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 text-primary hover:text-primary/80"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(link.title || "");
              }}
              className="p-1 text-foreground-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Internal links use Next.js Link, external use <a> */}
            {internalPath ? (
              <div className="flex flex-col gap-0.5">
                {/* For task links with relationship, show "relationship → taskname" format */}
                {linkType === "task" && link.relationship_type ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-foreground-muted">
                      {RELATIONSHIP_TYPE_LABELS[link.relationship_type]}
                    </span>
                    <Link
                      href={internalPath}
                      className="text-foreground hover:text-primary font-medium"
                    >
                      {displayTitle}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={internalPath}
                    className="text-sm text-foreground hover:text-primary flex items-center gap-1"
                  >
                    {displayTitle}
                    {linkType === "idea" && (
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Idea
                      </span>
                    )}
                    {linkType === "task" && (
                      <span className="text-[10px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        Task
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ) : (
              <>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-primary flex items-center gap-1"
                >
                  {displayTitle}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
                <div className="text-xs text-foreground-muted truncate">{link.url}</div>
              </>
            )}
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-foreground-muted hover:text-primary"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-foreground-muted hover:text-error"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
