"use client";

/**
 * LinksSection Component
 * External links for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { Link2, Plus, Trash2, ExternalLink, Pencil, Check, X } from "lucide-react";
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
import type { DbLink } from "@/types/database";

interface LinksSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when links change */
  onLinksChange?: (count: number) => void;
}

export function LinksSection({
  ideaId,
  taskId,
  className,
  onLinksChange,
}: LinksSectionProps) {
  const [links, setLinks] = useState<DbLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFavicon, setNewFavicon] = useState("🔗");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load links on mount
  useEffect(() => {
    loadLinks();
  }, [ideaId, taskId]);

  // Update callback when links change
  useEffect(() => {
    onLinksChange?.(links.length);
  }, [links, onLinksChange]);

  async function loadLinks() {
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
  }

  async function handleAddLink() {
    if (!newUrl.trim()) return;

    const normalised = normaliseUrl(newUrl.trim());
    if (!isValidUrl(normalised)) {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
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
      setNewUrl("");
      setNewTitle("");
      setNewFavicon("🔗");
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

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Link2 className="w-4 h-4 text-zinc-500" />
          Links
          {links.length > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {links.length}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="p-3 bg-zinc-800/50 rounded-lg space-y-3">
          {error && (
            <div className="text-xs text-red-400">{error}</div>
          )}
          <input
            ref={inputRef}
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLink();
              if (e.key === "Escape") {
                setShowAddForm(false);
                setNewUrl("");
                setNewTitle("");
                setError(null);
              }
            }}
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {/* Favicon picker */}
          <div>
            <div className="text-xs text-zinc-500 mb-2">Icon</div>
            <div className="flex flex-wrap gap-1">
              {LINK_FAVICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewFavicon(emoji)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded text-lg transition-colors",
                    newFavicon === emoji
                      ? "bg-cyan-500/20 ring-1 ring-cyan-500"
                      : "hover:bg-zinc-700"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewUrl("");
                setNewTitle("");
                setError(null);
              }}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLink}
              disabled={!newUrl.trim() || isAdding}
              className="px-3 py-1.5 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add Link"}
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {isLoading ? (
        <div className="text-xs text-zinc-500">Loading...</div>
      ) : links.length === 0 && !showAddForm ? (
        <div className="text-xs text-zinc-500">No links</div>
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

  const domain = extractDomain(link.url);
  const displayTitle = link.title || domain;

  function handleSaveEdit() {
    onUpdate({ title: editTitle.trim() || undefined });
    setIsEditing(false);
  }

  return (
    <div className="flex items-start gap-3 px-3 py-2 bg-zinc-800/50 rounded-lg group hover:bg-zinc-800">
      <span className="text-lg mt-0.5">{link.favicon || "🔗"}</span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-zinc-700 border border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
              className="p-1 text-cyan-400 hover:text-cyan-300"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(link.title || "");
              }}
              className="p-1 text-zinc-400 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-300 hover:text-cyan-400 flex items-center gap-1"
            >
              {displayTitle}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <div className="text-xs text-zinc-500 truncate">{link.url}</div>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-zinc-400 hover:text-cyan-400"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-zinc-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
