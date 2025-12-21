"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Lightbulb, Search, Loader2 } from "lucide-react";
import {
  getIdeas,
  deleteIdea,
  getIdeaCounts,
  bulkArchiveIdeas,
  bulkDeleteIdeas,
  bulkUpdateStatus,
  bulkUpdateEffort,
  bulkUpdateHorizon,
  bulkAddLabel,
  getAllIdeasTaskProgress,
  type IdeaTaskProgress,
} from "@/lib/api/ideas";
import { getAllIdeaLabels, getLabels } from "@/lib/api/labels";
import { NoIdeasEmptyState } from "@/components/shared";
import {
  IdeasTable,
  IdeaForm,
  IdeaDetailSlider,
  FilterPanel,
  BulkActionBar,
  SavedViewsDropdown,
  PublishViewDialog,
  DEFAULT_FILTERS,
} from "@/components/ideas";
import type { SortField, SortOrder, IdeaFilters } from "@/components/ideas";
import type { DbIdea, DbSavedView, DbLabel, IdeaStatus, ColumnConfig, SavedViewFilters, DEFAULT_IDEA_COLUMNS } from "@/types/database";

// Default columns for the ideas table
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "title", visible: true, width: 300, order: 0 },
  { id: "status", visible: true, width: 120, order: 1 },
  { id: "labels", visible: true, width: 150, order: 2 },
  { id: "horizon", visible: true, width: 100, order: 3 },
  { id: "rice_score", visible: true, width: 80, order: 4 },
  { id: "progress", visible: false, width: 120, order: 5 },
  { id: "updated_at", visible: true, width: 140, order: 6 },
  { id: "created_at", visible: false, width: 140, order: 7 },
  { id: "description", visible: false, width: 200, order: 8 },
  { id: "effort_estimate", visible: false, width: 100, order: 9 },
  { id: "owner", visible: false, width: 100, order: 10 },
  { id: "started_at", visible: false, width: 140, order: 11 },
  { id: "completed_at", visible: false, width: 140, order: 12 },
  { id: "themes", visible: false, width: 150, order: 13 },
  { id: "rice_reach", visible: false, width: 80, order: 14 },
  { id: "rice_impact", visible: false, width: 80, order: 15 },
  { id: "rice_confidence", visible: false, width: 100, order: 16 },
  { id: "rice_effort", visible: false, width: 80, order: 17 },
];

// Load column config from localStorage or use defaults
function loadColumnConfig(): ColumnConfig[] {
  if (typeof window === "undefined") {
    return DEFAULT_COLUMNS;
  }
  const saved = localStorage.getItem("autoflow:ideas:columns");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as ColumnConfig[];
      // Merge with defaults to pick up new columns
      const savedIds = new Set(parsed.map((c) => c.id));
      const newColumns = DEFAULT_COLUMNS.filter((c) => !savedIds.has(c.id));
      return [...parsed, ...newColumns];
    } catch {
      // Fall through to default
    }
  }
  return DEFAULT_COLUMNS;
}

export default function IdeasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  // Data state
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [ideaLabels, setIdeaLabels] = useState<Record<string, DbLabel[]>>({});
  const [ideaProgress, setIdeaProgress] = useState<Record<string, IdeaTaskProgress>>({});
  const [ideaCounts, setIdeaCounts] = useState<Record<IdeaStatus, number> | null>(null);
  const [availableLabels, setAvailableLabels] = useState<DbLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DbIdea | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumnConfig);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<IdeaFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareView, setShareView] = useState<DbSavedView | null>(null);

  // Get the selected idea for detail modal
  const viewingIdea = selectedId ? ideas.find((i) => i.id === selectedId) : null;

  // Save column config when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoflow:ideas:columns", JSON.stringify(columns));
    }
  }, [columns]);

  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter params
      const filterParams: Parameters<typeof getIdeas>[0] = {
        archived: filters.archived,
        sortBy: sortField === "score" ? "updated_at" : sortField,
        sortOrder,
      };

      if (filters.statuses.length > 0) {
        filterParams.status = filters.statuses;
      }

      if (filters.search || searchQuery) {
        filterParams.search = filters.search || searchQuery;
      }

      const [data, counts, labels, progress, allLabels] = await Promise.all([
        getIdeas(filterParams),
        getIdeaCounts(),
        getAllIdeaLabels(),
        getAllIdeasTaskProgress(),
        getLabels(),
      ]);

      setIdeas(data);
      setIdeaCounts(counts);
      setIdeaLabels(labels);
      setIdeaProgress(progress);
      setAvailableLabels(allLabels.filter((l) => l.name)); // Only show labels with names
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // Handlers
  const handleCreateNew = () => {
    setEditingIdea(null);
    setShowForm(true);
  };

  const handleIdeaClick = (idea: DbIdea) => {
    // Update URL with selected idea
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", idea.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/ideas";
    router.push(newUrl, { scroll: false });
  };

  const handleEdit = (idea: DbIdea) => {
    handleCloseDetail();
    setEditingIdea(idea);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this idea?")) {
      return;
    }

    try {
      await deleteIdea(id);
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      handleCloseDetail();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete idea");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIdea(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadIdeas();
  };

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Bulk operations
  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    await bulkArchiveIdeas(ids);
    setSelectedIds(new Set());
    loadIdeas();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await bulkDeleteIdeas(ids);
    setSelectedIds(new Set());
    loadIdeas();
  };

  const handleBulkStatusChange = async (status: IdeaStatus) => {
    const ids = Array.from(selectedIds);
    await bulkUpdateStatus(ids, status);
    setSelectedIds(new Set());
    loadIdeas();
  };

  const handleBulkLabelChange = async (labelId: string, action: "add" | "remove") => {
    const ids = Array.from(selectedIds);
    if (action === "add") {
      await bulkAddLabel(ids, labelId);
    }
    // Note: Remove not implemented yet - would need a bulkRemoveLabel function
    setSelectedIds(new Set());
    loadIdeas();
  };

  const handleBulkEffortChange = async (effort: DbIdea["effort_estimate"]) => {
    const ids = Array.from(selectedIds);
    await bulkUpdateEffort(ids, effort);
    setSelectedIds(new Set());
    loadIdeas();
  };

  const handleBulkHorizonChange = async (horizon: DbIdea["horizon"]) => {
    const ids = Array.from(selectedIds);
    await bulkUpdateHorizon(ids, horizon);
    setSelectedIds(new Set());
    loadIdeas();
  };

  // Handle loading a saved view
  const handleLoadView = (viewFilters: IdeaFilters, viewColumns?: ColumnConfig[]) => {
    setFilters(viewFilters);
    if (viewColumns) {
      setColumns(viewColumns);
    }
  };

  // Handle sharing a view
  const handleShareView = (view: DbSavedView | null) => {
    setShareView(view);
    setShowShareDialog(true);
  };

  // Extract unique owners from ideas for filter dropdown
  const availableOwners = Array.from(
    new Set(ideas.map((idea) => idea.owner).filter(Boolean))
  ) as string[];

  // Filter ideas by search query and other filters (client-side for instant feedback)
  const filteredIdeas = ideas.filter((idea) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        idea.title.toLowerCase().includes(query) ||
        idea.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Label filter (OR logic - idea matches if it has ANY of the selected labels)
    if (filters.labelIds.length > 0) {
      const ideaLabelIds = (ideaLabels[idea.id] || []).map((l) => l.id);
      const hasMatchingLabel = filters.labelIds.some((labelId) =>
        ideaLabelIds.includes(labelId)
      );
      if (!hasMatchingLabel) return false;
    }

    // Owner filter
    if (filters.owners.length > 0) {
      if (!idea.owner || !filters.owners.includes(idea.owner)) return false;
    }

    // Effort filter
    if (filters.efforts.length > 0) {
      if (!idea.effort_estimate || !filters.efforts.includes(idea.effort_estimate)) return false;
    }

    // Horizon filter (already handled by API, but double-check client-side)
    if (filters.horizons.length > 0) {
      if (!filters.horizons.includes(idea.horizon)) return false;
    }

    return true;
  });

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <header className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Ideas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Capture and evaluate automation ideas
          </p>
        </div>
        <button className="btn btn-primary w-full sm:w-auto" onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Idea
        </button>
      </header>

      {/* Search bar and Saved Views */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <SavedViewsDropdown
          currentFilters={filters}
          currentColumns={columns}
          onLoadView={handleLoadView}
          onShareView={handleShareView}
        />
      </div>

      {/* Filter panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        ideaCounts={ideaCounts || undefined}
        availableLabels={availableLabels}
        availableOwners={availableOwners}
      />

      {/* Content */}
      {error ? (
        <div className="card bg-error/10 border-error/20 text-center py-8">
          <p className="text-error">{error}</p>
          <button className="btn btn-outline mt-4" onClick={loadIdeas}>
            Try again
          </button>
        </div>
      ) : filteredIdeas.length === 0 && !loading ? (
        ideas.length === 0 ? (
          <NoIdeasEmptyState
            action={
              <button className="btn btn-primary" onClick={handleCreateNew}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Capture your first idea
              </button>
            }
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No ideas match your filters</p>
          </div>
        )
      ) : (
        <IdeasTable
          ideas={filteredIdeas}
          columns={columns}
          onColumnsChange={setColumns}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onIdeaClick={handleIdeaClick}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          ideaLabels={ideaLabels}
          ideaProgress={ideaProgress}
          loading={loading}
        />
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onStatusChange={handleBulkStatusChange}
        onLabelChange={handleBulkLabelChange}
        onEffortChange={handleBulkEffortChange}
        onHorizonChange={handleBulkHorizonChange}
        onClearSelection={() => setSelectedIds(new Set())}
        availableLabels={availableLabels}
      />

      {/* Idea Detail Slider */}
      {viewingIdea && (
        <IdeaDetailSlider
          idea={viewingIdea}
          onClose={handleCloseDetail}
          onUpdate={(updated) => {
            setIdeas((prev) =>
              prev.map((i) => (i.id === updated.id ? updated : i))
            );
          }}
          onDelete={(id) => {
            setIdeas((prev) => prev.filter((i) => i.id !== id));
          }}
        />
      )}

      {/* Idea Form Modal */}
      {showForm && (
        <IdeaForm
          idea={editingIdea}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Share View Dialog */}
      <PublishViewDialog
        isOpen={showShareDialog}
        onClose={() => {
          setShowShareDialog(false);
          setShareView(null);
        }}
        savedView={shareView}
        currentFilters={filters as unknown as SavedViewFilters}
        currentColumns={columns}
      />
    </div>
  );
}
