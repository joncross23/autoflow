"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Lightbulb, Search, Filter, Loader2 } from "lucide-react";
import { getIdeas, deleteIdea } from "@/lib/api/ideas";
import { NoIdeasEmptyState } from "@/components/shared";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import type { DbIdea, IdeaStatus } from "@/types/database";

const STATUS_FILTERS: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "evaluating", label: "Evaluating" },
  { value: "prioritised", label: "Prioritised" },
  { value: "converting", label: "Converting" },
  { value: "archived", label: "Archived" },
];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DbIdea | null>(null);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIdeas(statusFilter === "all" ? undefined : statusFilter);
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleCreateNew = () => {
    setEditingIdea(null);
    setShowForm(true);
  };

  const handleEdit = (idea: DbIdea) => {
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

  // Filter ideas by search query
  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="text-muted-foreground">
            Capture and evaluate automation ideas
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Idea
        </button>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
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

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | "all")}
            className="input"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="card bg-error/10 border-error/20 text-center py-8">
          <p className="text-error">{error}</p>
          <button
            className="btn btn-outline mt-4"
            onClick={loadIdeas}
          >
            Try again
          </button>
        </div>
      ) : filteredIdeas.length === 0 ? (
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
            <p className="text-muted-foreground">No ideas match your search</p>
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Idea Form Modal */}
      {showForm && (
        <IdeaForm
          idea={editingIdea}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
