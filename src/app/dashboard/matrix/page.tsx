"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { MatrixView } from "@/components/ideas/MatrixView";
import { IdeaDetailSlider } from "@/components/ideas/IdeaDetailSlider";
import { getIdeas, getRiceScoreStats } from "@/lib/api/ideas";
import type { DbIdea } from "@/types/database";

export default function MatrixPage() {
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<DbIdea | null>(null);
  const [stats, setStats] = useState<{
    scored: number;
    unscored: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ideasData, statsData] = await Promise.all([
        getIdeas({ archived: false }),
        getRiceScoreStats(),
      ]);
      setIdeas(ideasData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIdeaClick = (idea: DbIdea) => {
    setSelectedIdea(idea);
  };

  const handleIdeaUpdate = (updated: DbIdea) => {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelectedIdea(updated);
  };

  const handleIdeaDelete = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setSelectedIdea(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-error">{error}</p>
        <button onClick={loadData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Priority Matrix</h1>
          <p className="text-muted-foreground">
            Visualise ideas by Impact vs Effort to identify quick wins
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-2xl font-bold text-primary">{stats.scored}</div>
            <div className="text-xs text-muted-foreground">Scored Ideas</div>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-2xl font-bold text-muted-foreground">{stats.unscored}</div>
            <div className="text-xs text-muted-foreground">Unscored</div>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-2xl font-bold text-green-500">{stats.maxScore}</div>
            <div className="text-xs text-muted-foreground">Highest</div>
          </div>
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <div className="text-2xl font-bold text-red-500">{stats.minScore}</div>
            <div className="text-xs text-muted-foreground">Lowest</div>
          </div>
        </div>
      )}

      {/* Matrix View */}
      <MatrixView ideas={ideas} onIdeaClick={handleIdeaClick} />

      {/* Idea Detail Slider */}
      {selectedIdea && (
        <IdeaDetailSlider
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onUpdate={handleIdeaUpdate}
          onDelete={handleIdeaDelete}
        />
      )}
    </div>
  );
}
