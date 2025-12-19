"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  Gauge,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLatestEvaluation } from "@/lib/api/evaluations";
import type { DbAiEvaluation } from "@/types/database";

interface AiEvaluationPanelProps {
  ideaId: string;
  onEvaluationComplete?: () => void;
}

export function AiEvaluationPanel({
  ideaId,
  onEvaluationComplete,
}: AiEvaluationPanelProps) {
  const [evaluation, setEvaluation] = useState<DbAiEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluation = useCallback(async () => {
    try {
      const data = await getLatestEvaluation(ideaId);
      setEvaluation(data);
    } catch (err) {
      console.error("Failed to load evaluation:", err);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const runEvaluation = async () => {
    setEvaluating(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/evaluate`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Evaluation failed");
      }

      const { evaluation: newEvaluation } = await response.json();
      setEvaluation(newEvaluation);
      onEvaluationComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
        <h3 className="font-semibold mb-2">AI Evaluation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered insights on complexity, ROI, and implementation recommendations.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <button
          onClick={runEvaluation}
          disabled={evaluating}
          className="btn btn-primary"
        >
          {evaluating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Evaluating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run AI Evaluation
            </>
          )}
        </button>
      </div>
    );
  }

  const priorityColors = {
    low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header with re-evaluate button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Evaluation</h3>
        </div>
        <button
          onClick={runEvaluation}
          disabled={evaluating}
          className="btn btn-ghost text-xs px-2 py-1"
          title="Re-evaluate"
        >
          {evaluating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Priority Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Priority:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
            priorityColors[evaluation.overall_priority]
          )}
        >
          {evaluation.overall_priority}
        </span>
      </div>

      {/* Summary */}
      <div className="p-3 rounded-lg bg-bg-tertiary">
        <p className="text-sm">{evaluation.overall_summary}</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard
          icon={Gauge}
          label="Complexity"
          score={evaluation.complexity_score}
          rationale={evaluation.complexity_rationale}
          inverse
        />
        <ScoreCard
          icon={TrendingUp}
          label="ROI"
          score={evaluation.roi_score}
          rationale={evaluation.roi_rationale}
        />
        <ScoreCard
          icon={Clock}
          label="Time Saved"
          value={`${evaluation.time_saved_hours}h/yr`}
          rationale={evaluation.time_saved_rationale}
        />
      </div>

      {/* Recommendations */}
      {evaluation.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {evaluation.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {evaluation.risks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risks
          </h4>
          <ul className="space-y-1">
            {evaluation.risks.map((risk, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6">
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        Evaluated {new Date(evaluation.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  value,
  rationale,
  inverse,
}: {
  icon: React.ElementType;
  label: string;
  score?: number;
  value?: string;
  rationale: string;
  inverse?: boolean;
}) {
  const getScoreColor = (s: number, inv: boolean) => {
    const effectiveScore = inv ? 6 - s : s;
    if (effectiveScore >= 4) return "text-success";
    if (effectiveScore >= 3) return "text-warning";
    return "text-error";
  };

  return (
    <div className="p-3 rounded-lg bg-bg-tertiary text-center" title={rationale}>
      <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
      <div
        className={cn(
          "text-lg font-bold",
          score !== undefined && getScoreColor(score, inverse || false)
        )}
      >
        {value || `${score}/5`}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
