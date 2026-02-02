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
  bulkUpdateCategory,
  bulkAddLabel,
  bulkRemoveLabel,
  getAllIdeasTaskProgress,
  reorderIdeas,
  type IdeaTaskProgress,
} from "@/lib/api/ideas";
import { getAllIdeaLabels, getLabels } from "@/lib/api/labels";
import { NoIdeasEmptyState } from "@/components/shared";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  IdeasTable,
  IdeaForm,
  IdeaDetailSlider,
  BulkActionBar,
  SavedViewsDropdown,
  PublishViewDialog,
  DEFAULT_FILTERS,
} from "@/components/ideas";
import type { SortField, SortOrder, IdeaFilters } from "@/components/ideas";
import {
  UnifiedFilterBar,
  ideaFiltersToValues,
  valuesToIdeaFilters,
  type FilterValue,
  QUADRANT_OPTIONS,
} from "@/components/filters";
import type { DbIdea, DbSavedView, DbLabel, IdeaStatus, ColumnConfig, SavedViewFilters, SortConfig, DEFAULT_IDEA_COLUMNS } from "@/types/database";

// Helper function for date filtering
function isWithinDateRange(date: string | null, range: string): boolean {
  // Handle "not started" / "not completed" filters
  if (range === "not-started" || range === "not-completed") {
    return date === null;
  }

  // If no date and we're looking for a specific range, exclude
  if (!date) return false;

  const d = new Date(date);
  const now = new Date();

  // Calculate date boundaries
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  switch (range) {
    case "today":
      return d >= startOfDay;
    case "yesterday": {
      const startOfYesterday = new Date(startOfDay);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return d >= startOfYesterday && d < startOfDay;
    }
    case "week":
    case "this-week":
      return d >= startOfWeek;
    case "month":
    case "this-month":
      return d >= startOfMonth;
    case "quarter":
    case "this-quarter":
      return d >= startOfQuarter;
    default:
      return true;
  }
}

// Default columns for the ideas table
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "title", visible: true, width: 300, order: 0 },
  { id: "category", visible: true, width: 130, order: 1 },
  { id: "status", visible: true, width: 120, order: 2 },
  { id: "labels", visible: true, width: 150, order: 3 },
  { id: "horizon", visible: true, width: 100, order: 4 },
  { id: "rice_score", visible: true, width: 80, order: 5 },
  { id: "progress", visible: false, width: 120, order: 6 },
  { id: "updated_at", visible: true, width: 140, order: 7 },
  { id: "created_at", visible: false, width: 140, order: 8 },
  { id: "description", visible: false, width: 200, order: 9 },
  { id: "effort_estimate", visible: false, width: 100, order: 10 },
  { id: "owner", visible: false, width: 100, order: 11 },
  { id: "started_at", visible: false, width: 140, order: 12 },
  { id: "completed_at", visible: false, width: 140, order: 13 },
  { id: "themes", visible: false, width: 150, order: 14 },
  { id: "rice_reach", visible: false, width: 80, order: 15 },
  { id: "rice_impact", visible: false, width: 80, order: 16 },
  { id: "rice_confidence", visible: false, width: 100, order: 17 },
  { id: "rice_effort", visible: false, width: 80, order: 18 },
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
  const { confirm, dialog } = useConfirmDialog();

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
  const [rawFilterValues, setRawFilterValues] = useState<FilterValue[]>([]);
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

  // Seed quadrant filter from URL param (e.g. from matrix view navigation)
  useEffect(() => {
    const quadrantParam = searchParams.get("quadrant");
    if (quadrantParam && QUADRANT_OPTIONS.some((q) => q.value === quadrantParam)) {
      const option = QUADRANT_OPTIONS.find((q) => q.value === quadrantParam);
      const quadrantFilter: FilterValue = {
        id: `quadrant-${Date.now()}`,
        type: "quadrant",
        value: [quadrantParam],
        displayLabel: option?.label || "Quadrant",
      };
      setRawFilterValues((prev) => [...prev.filter((f) => f.type !== "quadrant"), quadrantFilter]);
      // Clear the URL param to avoid re-seeding
      const params = new URLSearchParams(searchParams.toString());
      params.delete("quadrant");
      const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/ideas";
      router.replace(newUrl, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter params
      const filterParams: Parameters<typeof getIdeas>[0] = {
        archived: filters.archived,
        sortBy: sortField === "score" ? "updated_at" : sortField === "custom" ? "position" : sortField,
        sortOrder: sortField === "custom" ? "asc" : sortOrder,
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
    const confirmed = await confirm({
      title: "Delete Idea",
      message: "Are you sure you want to delete this idea? This cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

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

  // Handle drag-and-drop reorder
  const handleReorder = async (reorderedIdeas: DbIdea[]) => {
    // Optimistic update — set new order immediately
    setIdeas(reorderedIdeas);

    // Build position updates
    const items = reorderedIdeas.map((idea, index) => ({
      id: idea.id,
      position: index,
    }));

    try {
      await reorderIdeas(items);
    } catch (err) {
      console.error("Failed to save order:", err);
      // Reload to restore server state on error
      loadIdeas();
    }
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
    try {
      if (action === "add") {
        await bulkAddLabel(ids, labelId);
      } else {
        await bulkRemoveLabel(ids, labelId);
      }
      setSelectedIds(new Set());
      loadIdeas();
    } catch (err) {
      console.error(`Failed to ${action} label:`, err);
    }
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

  const handleBulkCategoryChange = async (category: DbIdea["category"]) => {
    const ids = Array.from(selectedIds);
    await bulkUpdateCategory(ids, category);
    setSelectedIds(new Set());
    loadIdeas();
  };

  // Handle loading a saved view
  const handleLoadView = (viewFilters: IdeaFilters, viewColumns?: ColumnConfig[], viewSort?: SortConfig) => {
    setFilters(viewFilters);
    setRawFilterValues(ideaFiltersToValues(viewFilters));
    if (viewColumns) {
      setColumns(viewColumns);
    }
    if (viewSort) {
      setSortField(viewSort.field as SortField);
      setSortOrder(viewSort.direction);
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

  // Handle filter changes from UnifiedFilterBar
  // Store raw FilterValue[] to avoid lossy round-trip conversion
  const handleFilterValuesChange = (newValues: FilterValue[]) => {
    setRawFilterValues(newValues);
    setFilters(valuesToIdeaFilters(newValues, searchQuery));
  };

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
    const filterLabelIds = filters.labelIds ?? [];
    if (filterLabelIds.length > 0) {
      const ideaLabelIds = (ideaLabels[idea.id] || []).map((l) => l.id);
      const hasMatchingLabel = filterLabelIds.some((labelId) =>
        ideaLabelIds.includes(labelId)
      );
      if (!hasMatchingLabel) return false;
    }

    // Owner filter
    const filterOwners = filters.owners ?? [];
    if (filterOwners.length > 0) {
      if (!idea.owner || !filterOwners.includes(idea.owner)) return false;
    }

    // Category filter
    const filterCategories = filters.categories ?? [];
    if (filterCategories.length > 0) {
      if (!idea.category || !filterCategories.includes(idea.category)) return false;
    }

    // Effort filter
    const filterEfforts = filters.efforts ?? [];
    if (filterEfforts.length > 0) {
      if (!idea.effort_estimate || !filterEfforts.includes(idea.effort_estimate)) return false;
    }

    // Horizon filter (already handled by API, but double-check client-side)
    const filterHorizons = filters.horizons ?? [];
    if (filterHorizons.length > 0) {
      if (!filterHorizons.includes(idea.horizon)) return false;
    }

    // Date filters - use filterValues since they contain the raw filter data
    // CreatedAt filter
    const createdAtFilter = rawFilterValues.find((f) => f.type === "createdAt");
    if (createdAtFilter) {
      const range = Array.isArray(createdAtFilter.value) ? createdAtFilter.value[0] : createdAtFilter.value;
      if (!isWithinDateRange(idea.created_at, range as string)) return false;
    }

    // StartedAt filter
    const startedAtFilter = rawFilterValues.find((f) => f.type === "startedAt");
    if (startedAtFilter) {
      const range = Array.isArray(startedAtFilter.value) ? startedAtFilter.value[0] : startedAtFilter.value;
      if (!isWithinDateRange(idea.started_at, range as string)) return false;
    }

    // CompletedAt filter
    const completedAtFilter = rawFilterValues.find((f) => f.type === "completedAt");
    if (completedAtFilter) {
      const range = Array.isArray(completedAtFilter.value) ? completedAtFilter.value[0] : completedAtFilter.value;
      if (!isWithinDateRange(idea.completed_at, range as string)) return false;
    }

    // Quadrant filter (from filter bar or matrix view navigation)
    const quadrantFilter = rawFilterValues.find((f) => f.type === "quadrant");
    if (quadrantFilter) {
      const selectedQuadrants = Array.isArray(quadrantFilter.value) ? quadrantFilter.value : [quadrantFilter.value];
      const effort = idea.rice_effort;
      const impact = idea.rice_impact;
      const impactMapping: Record<number, number> = { 0.25: 10, 0.5: 25, 1: 50, 2: 75, 3: 90 };
      const y = impact ? (impactMapping[impact] ?? 50) : 50;
      const x = effort ? 5 + (effort - 1) * 10 : 50;
      const ideaQuadrant =
        y >= 50 && x < 50 ? "topLeft" :
        y >= 50 && x >= 50 ? "topRight" :
        y < 50 && x < 50 ? "bottomLeft" : "bottomRight";
      if (!selectedQuadrants.includes(ideaQuadrant)) return false;
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
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn btn-primary flex-1 sm:flex-initial" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Idea
          </button>
          <div className="relative group flex-1 sm:flex-initial">
            <button
              className="btn btn-outline w-full"
              onClick={() => router.push('/dashboard/ideas/capture')}
              aria-label="Guided Capture - 2 minutes, 4 questions"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Guided Capture
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-xs font-bold">
                ?
              </span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-popover border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              <div className="font-medium mb-1">Guided Capture</div>
              <div className="text-muted-foreground">2 minutes • 4 questions</div>
            </div>
          </div>
        </div>
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
          currentSort={{ field: sortField, direction: sortOrder }}
          onLoadView={handleLoadView}
          onShareView={handleShareView}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <UnifiedFilterBar
          context="ideas"
          filters={rawFilterValues}
          onFiltersChange={handleFilterValuesChange}
          labels={availableLabels}
          owners={availableOwners}
        />
      </div>

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
          onReorder={handleReorder}
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
        onCategoryChange={handleBulkCategoryChange}
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

      {dialog}
    </div>
  );
}
