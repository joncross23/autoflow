"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Loader2,
  Globe,
  Lock,
  Calendar,
  Eye,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getPublishedViews,
  publishView,
  quickPublishView,
  unpublishView,
  deletePublishedView,
  generateSlug,
  isSlugAvailable,
} from "@/lib/api/views";
import type { DbSavedView, DbPublishedView, SavedViewFilters, ColumnConfig } from "@/types/database";

interface PublishViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savedView?: DbSavedView | null;
  currentFilters?: SavedViewFilters;
  currentColumns?: ColumnConfig[];
}

export function PublishViewDialog({
  isOpen,
  onClose,
  savedView,
  currentFilters,
  currentColumns,
}: PublishViewDialogProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [mode, setMode] = useState<"publish" | "manage">("publish");
  const [publishedViews, setPublishedViews] = useState<DbPublishedView[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Load published views
  useEffect(() => {
    if (isOpen) {
      loadPublishedViews();
      // Pre-fill from saved view
      if (savedView) {
        setName(savedView.name);
        setSlug(generateSlug(savedView.name));
        setDescription(savedView.description || "");
      } else {
        setName("");
        setSlug(generateSlug("shared-view"));
        setDescription("");
      }
    }
  }, [isOpen, savedView]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      const available = await isSlugAvailable(slug);
      setSlugAvailable(available);
      setCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const loadPublishedViews = async () => {
    setLoading(true);
    try {
      const views = await getPublishedViews();
      setPublishedViews(views);
    } catch (error) {
      console.error("Failed to load published views:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!name.trim() || !slug.trim() || !slugAvailable) return;

    setPublishing(true);
    try {
      let published: DbPublishedView;

      if (savedView) {
        // Publish from saved view
        published = await publishView(savedView.id, {
          slug: slug.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          expiresAt: expiresAt || undefined,
          password: usePassword && password ? password : undefined,
        });
      } else if (currentFilters) {
        // Quick publish current view
        published = await quickPublishView({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          filters: currentFilters,
          column_config: currentColumns || null,
          expires_at: expiresAt || null,
          password_hash: null, // Would need server-side hashing
        });
      } else {
        throw new Error("No view to publish");
      }

      setPublishedViews((prev) => [published, ...prev]);
      setMode("manage");

      // Reset form
      setName("");
      setSlug("");
      setDescription("");
      setExpiresAt("");
      setPassword("");
      setUsePassword(false);
    } catch (error) {
      console.error("Failed to publish view:", error);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async (view: DbPublishedView) => {
    try {
      await unpublishView(view.id);
      setPublishedViews((prev) =>
        prev.map((v) => (v.id === view.id ? { ...v, is_active: false } : v))
      );
    } catch (error) {
      console.error("Failed to unpublish view:", error);
    }
  };

  const handleDelete = async (view: DbPublishedView) => {
    const confirmed = await confirm({
      title: "Delete Published View",
      message: `Are you sure you want to delete "${view.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      await deletePublishedView(view.id);
      setPublishedViews((prev) => prev.filter((v) => v.id !== view.id));
    } catch (error) {
      console.error("Failed to delete published view:", error);
    }
  };

  const getShareUrl = (view: DbPublishedView) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share/${view.slug}`;
    }
    return `/share/${view.slug}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-lg border border-border bg-bg-elevated shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Share View</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode("publish")}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              mode === "publish"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-text"
            )}
          >
            Publish New
          </button>
          <button
            onClick={() => setMode("manage")}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              mode === "manage"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-text"
            )}
          >
            Manage ({publishedViews.filter((v) => v.is_active).length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {mode === "publish" ? (
            <div className="space-y-4">
              {savedView && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary">
                    Publishing from saved view: <strong>{savedView.name}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Q1 Roadmap"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/share/</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                        )
                      }
                      placeholder="q1-roadmap"
                      className={cn(
                        "input w-full pr-8",
                        slugAvailable === false && "border-error"
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {checkingSlug ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : slugAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : slugAvailable === false ? (
                        <X className="h-4 w-4 text-error" />
                      ) : null}
                    </div>
                  </div>
                </div>
                {slugAvailable === false && (
                  <p className="text-xs text-error mt-1">
                    This slug is already taken
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for viewers"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expires <span className="text-muted-foreground">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => setUsePassword(e.target.checked)}
                    className="rounded"
                  />
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Password protect</span>
                </label>
              </div>

              {usePassword && (
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input w-full"
                  />
                </div>
              )}

              <button
                onClick={handlePublish}
                disabled={!name.trim() || !slug.trim() || !slugAvailable || publishing}
                className="btn btn-primary w-full"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Publish View
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : publishedViews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No published views yet</p>
                  <button
                    onClick={() => setMode("publish")}
                    className="text-primary hover:underline mt-2 text-sm"
                  >
                    Publish your first view
                  </button>
                </div>
              ) : (
                publishedViews.map((view) => (
                  <div
                    key={view.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      view.is_active
                        ? "border-border bg-bg-secondary"
                        : "border-border/50 bg-bg-tertiary opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{view.name}</h4>
                          {!view.is_active && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-error/10 text-error">
                              Inactive
                            </span>
                          )}
                          {view.password_hash && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        {view.description && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {view.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {view.view_count} views
                          </span>
                          {view.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires {new Date(view.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(getShareUrl(view), view.id)}
                          className="p-1.5 rounded hover:bg-bg-hover transition-colors"
                          title="Copy link"
                        >
                          {copied === view.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <a
                          href={getShareUrl(view)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-bg-hover transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                        {view.is_active ? (
                          <button
                            onClick={() => handleUnpublish(view)}
                            className="p-1.5 rounded hover:bg-bg-hover transition-colors"
                            title="Deactivate"
                          >
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(view)}
                          className="p-1.5 rounded hover:bg-bg-hover transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-error" />
                        </button>
                      </div>
                    </div>

                    {view.is_active && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={getShareUrl(view)}
                            readOnly
                            className="input flex-1 text-xs bg-bg-tertiary"
                          />
                          <button
                            onClick={() => copyToClipboard(getShareUrl(view), view.id)}
                            className="btn btn-ghost text-xs"
                          >
                            {copied === view.id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {dialog}
    </>
  );
}
