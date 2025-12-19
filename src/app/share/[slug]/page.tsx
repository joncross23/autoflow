"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Lock, Calendar, Eye, AlertCircle } from "lucide-react";
import { getPublishedViewBySlug, verifyPassword, incrementViewCount } from "@/lib/api/views";
import { getIdeas } from "@/lib/api/ideas";
import type { DbPublishedView, DbIdea, SavedViewFilters, ColumnConfig } from "@/types/database";

// Read-only status badge
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500",
    evaluating: "bg-yellow-500/10 text-yellow-500",
    accepted: "bg-green-500/10 text-green-500",
    doing: "bg-purple-500/10 text-purple-500",
    complete: "bg-emerald-500/10 text-emerald-500",
    parked: "bg-slate-500/10 text-slate-500",
    dropped: "bg-red-500/10 text-red-500",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-500/10 text-gray-500"}`}>
      {status}
    </span>
  );
}

// Read-only score badge
function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">-</span>;

  const color =
    score >= 8 ? "text-green-500" :
    score >= 5 ? "text-yellow-500" :
    "text-muted-foreground";

  return <span className={`font-medium ${color}`}>{score.toFixed(1)}</span>;
}

export default function SharedViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [view, setView] = useState<DbPublishedView | null>(null);
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Load the published view
  useEffect(() => {
    const loadView = async () => {
      try {
        setLoading(true);
        setError(null);

        const publishedView = await getPublishedViewBySlug(slug);

        if (!publishedView) {
          setError("View not found or has expired");
          return;
        }

        setView(publishedView);

        // Check if password is required
        if (publishedView.password_hash && !authenticated) {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }

        // Load the ideas with the view's filters
        await loadIdeas(publishedView);

        // Increment view count
        incrementViewCount(publishedView.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load view");
      } finally {
        setLoading(false);
      }
    };

    loadView();
  }, [slug, authenticated]);

  const loadIdeas = async (publishedView: DbPublishedView) => {
    try {
      const filters = publishedView.filters as SavedViewFilters;

      // Build filter params from saved filters
      const filterParams: Record<string, unknown> = {};

      if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
        filterParams.status = filters.statuses;
      }

      if (filters.archived !== undefined) {
        filterParams.archived = filters.archived;
      }

      if (filters.search) {
        filterParams.search = filters.search;
      }

      const data = await getIdeas(filterParams);
      setIdeas(data);
    } catch (err) {
      console.error("Failed to load ideas:", err);
      setError("Failed to load data");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!view?.password_hash) return;

    const isValid = await verifyPassword(password, view.password_hash);

    if (isValid) {
      setPasswordError(false);
      setNeedsPassword(false);
      setAuthenticated(true);
    } else {
      setPasswordError(true);
    }
  };

  // Get visible columns from config
  const getVisibleColumns = (): ColumnConfig[] => {
    if (view?.column_config && view.column_config.length > 0) {
      return view.column_config.filter((c) => c.visible).sort((a, b) => a.order - b.order);
    }
    // Default columns
    return [
      { id: "title", visible: true, width: 300, order: 0 },
      { id: "status", visible: true, width: 120, order: 1 },
      { id: "rice_score", visible: true, width: 100, order: 2 },
      { id: "updated_at", visible: true, width: 140, order: 3 },
    ];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const renderCellContent = (idea: DbIdea, columnId: string) => {
    switch (columnId) {
      case "title":
        return <span className="font-medium">{idea.title}</span>;
      case "status":
        return <StatusBadge status={idea.status} />;
      case "rice_score":
      case "score":
        return <ScoreBadge score={idea.rice_score} />;
      case "updated_at":
        return <span className="text-muted-foreground text-sm">{formatDate(idea.updated_at)}</span>;
      case "created_at":
        return <span className="text-muted-foreground text-sm">{formatDate(idea.created_at)}</span>;
      case "description":
        return <span className="text-sm text-muted-foreground truncate">{idea.description || "-"}</span>;
      case "effort_estimate":
        return <span className="text-sm">{idea.effort_estimate || "-"}</span>;
      case "owner":
        return <span className="text-sm">{idea.owner || "-"}</span>;
      case "started_at":
        return <span className="text-muted-foreground text-sm">{formatDate(idea.started_at)}</span>;
      case "completed_at":
        return <span className="text-muted-foreground text-sm">{formatDate(idea.completed_at)}</span>;
      default:
        return "-";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">View Not Available</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm">
          <div className="card p-6 text-center">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Password Required</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This view is password protected.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter password"
                className={`input w-full ${passwordError ? "border-error" : ""}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-error">Incorrect password</p>
              )}
              <button type="submit" className="btn btn-primary w-full">
                View
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const visibleColumns = getVisibleColumns();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-bg-elevated">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{view?.name}</h1>
              {view?.description && (
                <p className="text-muted-foreground mt-1">{view.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {view?.view_count} views
              </span>
              {view?.expires_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expires {new Date(view.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                      style={{ width: col.width }}
                    >
                      {col.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ideas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No ideas to display
                    </td>
                  </tr>
                ) : (
                  ideas.map((idea) => (
                    <tr
                      key={idea.id}
                      className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors"
                    >
                      {visibleColumns.map((col) => (
                        <td key={col.id} className="px-4 py-3">
                          {renderCellContent(idea, col.id)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a
              href="/"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AutoFlow
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
