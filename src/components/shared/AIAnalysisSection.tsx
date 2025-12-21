"use client";

/**
 * AIAnalysisSection Component
 * AI-powered analysis for tasks (manual trigger only)
 * V1.3: Rich Cards feature
 */

import { useState } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestion {
  type: "subtask" | "blocker" | "tip";
  text: string;
}

interface AIAnalysisData {
  suggestions: AISuggestion[];
  complexity: "low" | "medium" | "high";
  generatedAt: string;
}

interface AIAnalysisSectionProps {
  /** ID of the task */
  taskId: string;
  /** Task title for context */
  taskTitle: string;
  /** Task description for context */
  taskDescription?: string | null;
  /** Custom class name */
  className?: string;
}

export function AIAnalysisSection({
  taskId,
  taskTitle,
  taskDescription,
  className,
}: AIAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI analysis");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error running analysis:", error);
      setError(error instanceof Error ? error.message : "Failed to run analysis");
    } finally {
      setIsLoading(false);
    }
  }

  // Icon for suggestion type
  const getTypeIcon = (type: AISuggestion["type"]) => {
    switch (type) {
      case "subtask":
        return "📋";
      case "blocker":
        return "⚠️";
      case "tip":
        return "💡";
      default:
        return "•";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Analysis
        </div>
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="text-xs text-foreground-muted hover:text-cyan-400 flex items-center gap-1 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {analysis ? "Regenerate" : "Analyse"}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-foreground-muted py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analysing task...
        </div>
      ) : error ? (
        <div className="text-xs text-error py-2">{error}</div>
      ) : !analysis ? (
        <div className="text-xs text-foreground-muted py-2">
          Click Analyse to get AI-powered insights for this task.
        </div>
      ) : (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3 space-y-2">
          {/* Complexity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Complexity:</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded",
                analysis.complexity === "low" && "bg-green-500/20 text-green-400",
                analysis.complexity === "medium" && "bg-yellow-500/20 text-yellow-400",
                analysis.complexity === "high" && "bg-red-500/20 text-red-400"
              )}
            >
              {analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)}
            </span>
          </div>

          {/* Suggestions List */}
          {analysis.suggestions.length > 0 ? (
            <ul className="space-y-1.5">
              {analysis.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span>{getTypeIcon(suggestion.type)}</span>
                  <span>{suggestion.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-foreground-muted">No specific suggestions.</div>
          )}
        </div>
      )}
    </div>
  );
}
