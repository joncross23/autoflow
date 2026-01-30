"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  Gauge,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLatestEvaluation } from "@/lib/api/evaluations";
import type { DbAiEvaluation } from "@/types/database";

interface AiEvaluationPanelProps {
  ideaId: string;
  onEvaluationComplete?: () => void;
  /** Callback when evaluation existence changes */
  onHasEvaluationChange?: (hasEvaluation: boolean) => void;
  /** Hide the section header (when wrapped in CollapsibleSection) */
  hideHeader?: boolean;
}

export function AiEvaluationPanel({
  ideaId,
  onEvaluationComplete,
  onHasEvaluationChange,
  hideHeader = false,
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

  // Notify parent when evaluation changes
  useEffect(() => {
    onHasEvaluationChange?.(evaluation !== null);
  }, [evaluation, onHasEvaluationChange]);

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

      const responseData = await response.json();
      const newEvaluation = responseData?.evaluation;
      if (newEvaluation && newEvaluation.overall_summary) {
        // Ensure recommendations and risks are arrays (Supabase may return TEXT[] as strings)
        setEvaluation({
          ...newEvaluation,
          recommendations: Array.isArray(newEvaluation.recommendations)
            ? newEvaluation.recommendations
            : [],
          risks: Array.isArray(newEvaluation.risks)
            ? newEvaluation.risks
            : [],
        });
      } else {
        // Fallback: reload latest evaluation from database
        await loadEvaluation();
      }
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
        {!hideHeader && <h3 className="font-semibold mb-2">AI Evaluation</h3>}
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

  const getScoreColor = (score: number, inverse: boolean) => {
    const effective = inverse ? 6 - score : score;
    if (effective >= 4) return "text-success";
    if (effective >= 3) return "text-warning";
    return "text-error";
  };

  const priorityColors = {
    low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-4">
      {/* Header with re-evaluate button - hidden when wrapped in CollapsibleSection */}
      {!hideHeader && (
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
      )}

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Priority + Summary */}
      <div className="p-3 rounded-lg bg-bg-tertiary">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Priority:</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
              priorityColors[evaluation.overall_priority]
            )}
          >
            {evaluation.overall_priority}
          </span>
        </div>
        <p className="text-sm">{evaluation.overall_summary}</p>
      </div>

      {/* Recommendations */}
      {(evaluation.recommendations ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {(evaluation.recommendations ?? []).map((rec, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {(evaluation.risks ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risks
          </h4>
          <ul className="space-y-1.5">
            {(evaluation.risks ?? []).map((risk, i) => (
              <li key={i} className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-warning">
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compact Score Row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5" />
          Complexity: <strong className={getScoreColor(evaluation.complexity_score, true)}>{evaluation.complexity_score}/5</strong>
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          ROI: <strong className={getScoreColor(evaluation.roi_score, false)}>{evaluation.roi_score}/5</strong>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Saved: <strong>{evaluation.time_saved_hours}h/yr</strong>
        </span>
      </div>

      {/* Footer: Timestamp + Re-evaluate */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Evaluated {new Date(evaluation.created_at).toLocaleDateString()}
        </p>
        {hideHeader && (
          <button
            onClick={runEvaluation}
            disabled={evaluating}
            className="btn btn-ghost text-xs px-2 py-1 flex items-center gap-1.5"
          >
            {evaluating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Re-evaluating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Re-evaluate
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
