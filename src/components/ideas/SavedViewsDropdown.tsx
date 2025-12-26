"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  BookmarkPlus,
  ChevronDown,
  Check,
  Star,
  StarOff,
  Pencil,
  Trash2,
  Loader2,
  X,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getSavedViews,
  createSavedView,
  updateSavedView,
  deleteSavedView,
  setDefaultView,
} from "@/lib/api/views";
import type { DbSavedView, ColumnConfig, SavedViewFilters } from "@/types/database";
import type { IdeaFilters } from "./FilterPanel";

interface SavedViewsDropdownProps {
  currentFilters: IdeaFilters;
  currentColumns?: ColumnConfig[];
  onLoadView: (filters: IdeaFilters, columns?: ColumnConfig[]) => void;
  onShareView?: (view: DbSavedView | null) => void;
}

export function SavedViewsDropdown({
  currentFilters,
  currentColumns,
  onLoadView,
  onShareView,
}: SavedViewsDropdownProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [isOpen, setIsOpen] = useState(false);
  const [views, setViews] = useState<DbSavedView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingView, setEditingView] = useState<DbSavedView | null>(null);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  // Load saved views
  useEffect(() => {
    const loadViews = async () => {
      try {
        const data = await getSavedViews();
        setViews(data);
        // Set active view to default if exists
        const defaultView = data.find((v) => v.is_default);
        if (defaultView) {
          setActiveViewId(defaultView.id);
        }
      } catch (error) {
        console.error("Failed to load saved views:", error);
      } finally {
        setLoading(false);
      }
    };
    loadViews();
  }, []);

  const handleSaveView = async () => {
    if (!newViewName.trim()) return;

    setSaving(true);
    try {
      // Cast filters to SavedViewFilters for storage
      const filtersToSave = currentFilters as unknown as SavedViewFilters;

      if (editingView) {
        // Update existing view
        const updated = await updateSavedView(editingView.id, {
          name: newViewName.trim(),
          description: newViewDescription.trim() || null,
          filters: filtersToSave,
          column_config: currentColumns || null,
        });
        setViews((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        // Create new view
        const created = await createSavedView({
          name: newViewName.trim(),
          description: newViewDescription.trim() || null,
          filters: filtersToSave,
          column_config: currentColumns || null,
        });
        setViews((prev) => [...prev, created]);
        setActiveViewId(created.id);
      }
      setShowSaveDialog(false);
      setEditingView(null);
      setNewViewName("");
      setNewViewDescription("");
    } catch (error) {
      console.error("Failed to save view:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadView = (view: DbSavedView) => {
    setActiveViewId(view.id);
    // Cast saved filters back to IdeaFilters
    const loadedFilters = view.filters as unknown as IdeaFilters;
    onLoadView(loadedFilters, view.column_config || undefined);
    setIsOpen(false);
  };

  const handleSetDefault = async (view: DbSavedView) => {
    try {
      const updated = await setDefaultView(view.id);
      setViews((prev) =>
        prev.map((v) => ({
          ...v,
          is_default: v.id === updated.id,
        }))
      );
    } catch (error) {
      console.error("Failed to set default view:", error);
    }
  };

  const handleDeleteView = async (view: DbSavedView) => {
    const confirmed = await confirm({
      title: "Delete View",
      message: `Are you sure you want to delete the view "${view.name}"?`,
      confirmLabel: "Delete",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      await deleteSavedView(view.id);
      setViews((prev) => prev.filter((v) => v.id !== view.id));
      if (activeViewId === view.id) {
        setActiveViewId(null);
      }
    } catch (error) {
      console.error("Failed to delete view:", error);
    }
  };

  const handleEditView = (view: DbSavedView) => {
    setEditingView(view);
    setNewViewName(view.name);
    setNewViewDescription(view.description || "");
    setShowSaveDialog(true);
  };

  const activeView = views.find((v) => v.id === activeViewId);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors",
          activeView
            ? "border-primary bg-primary/10 text-primary"
            : "border-border hover:border-primary/50"
        )}
      >
        <Bookmark className="h-4 w-4" />
        <span className="max-w-[120px] truncate">
          {activeView ? activeView.name : "Saved Views"}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-border bg-bg-elevated shadow-lg z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-sm font-medium">Saved Views</span>
              <div className="flex items-center gap-2">
                {onShareView && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onShareView(activeView || null);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    title="Share views"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingView(null);
                    setNewViewName("");
                    setNewViewDescription("");
                    setShowSaveDialog(true);
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  Save Current
                </button>
              </div>
            </div>

            {/* Views List */}
            <div className="max-h-64 overflow-y-auto py-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : views.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No saved views yet
                </div>
              ) : (
                views.map((view) => (
                  <div
                    key={view.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 hover:bg-bg-hover transition-colors cursor-pointer",
                      activeViewId === view.id && "bg-primary/5"
                    )}
                  >
                    <button
                      onClick={() => handleLoadView(view)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        {activeViewId === view.id && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{view.name}</span>
                        {view.is_default && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      {view.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {view.description}
                        </p>
                      )}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onShareView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onShareView(view);
                          }}
                          className="p-1 rounded hover:bg-bg-tertiary"
                          title="Share view"
                        >
                          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(view);
                        }}
                        className="p-1 rounded hover:bg-bg-tertiary"
                        title={view.is_default ? "Remove as default" : "Set as default"}
                      >
                        {view.is_default ? (
                          <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Star className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditView(view);
                        }}
                        className="p-1 rounded hover:bg-bg-tertiary"
                        title="Edit view"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view);
                        }}
                        className="p-1 rounded hover:bg-bg-tertiary"
                        title="Delete view"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-error" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clear Selection */}
            {activeViewId && (
              <div className="border-t border-border px-3 py-2">
                <button
                  onClick={() => {
                    setActiveViewId(null);
                    setIsOpen(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-text"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowSaveDialog(false);
              setEditingView(null);
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg border border-border bg-bg-elevated shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingView ? "Edit View" : "Save Current View"}
              </h3>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setEditingView(null);
                }}
                className="p-1 rounded hover:bg-bg-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="e.g., High Priority Ideas"
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newViewDescription}
                  onChange={(e) => setNewViewDescription(e.target.value)}
                  placeholder="e.g., Ideas with RICE score above 5"
                  className="input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setEditingView(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveView}
                  disabled={!newViewName.trim() || saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingView ? (
                    "Update View"
                  ) : (
                    "Save View"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {dialog}
    </div>
  );
}
