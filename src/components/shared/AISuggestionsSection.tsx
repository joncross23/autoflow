"use client";

/**
 * AISuggestionsSection Component
 * AI-powered suggestions for tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestion {
  type: "subtask" | "blocker" | "tip";
  text: string;
}

interface AISuggestionsData {
  suggestions: AISuggestion[];
  complexity: "low" | "medium" | "high";
  generatedAt: string;
}

interface AISuggestionsSectionProps {
  /** ID of the task */
  taskId: string;
  /** Task title for context */
  taskTitle: string;
  /** Task description for context */
  taskDescription?: string | null;
  /** Custom class name */
  className?: string;
}

export function AISuggestionsSection({
  taskId,
  taskTitle,
  taskDescription,
  className,
}: AISuggestionsSectionProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedLoad, setHasTriedLoad] = useState(false);

  // Auto-load suggestions on mount if task has description
  useEffect(() => {
    if (taskDescription && !hasTriedLoad) {
      loadSuggestions();
    }
  }, [taskId, taskDescription]);

  async function loadSuggestions() {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setHasTriedLoad(true);

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
        throw new Error("Failed to get AI suggestions");
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      setError(error instanceof Error ? error.message : "Failed to load suggestions");
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
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Suggestions
        </div>
        <button
          onClick={loadSuggestions}
          disabled={isLoading}
          className="text-xs text-zinc-500 hover:text-cyan-400 flex items-center gap-1 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {suggestions ? "Regenerate" : "Analyse"}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analysing task...
        </div>
      ) : error ? (
        <div className="text-xs text-red-400 py-2">{error}</div>
      ) : !suggestions && !hasTriedLoad ? (
        <div className="text-xs text-zinc-500 py-2">
          Click Analyse to get AI-powered suggestions for this task.
        </div>
      ) : suggestions ? (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3 space-y-2">
          {/* Complexity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Complexity:</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded",
                suggestions.complexity === "low" && "bg-green-500/20 text-green-400",
                suggestions.complexity === "medium" && "bg-yellow-500/20 text-yellow-400",
                suggestions.complexity === "high" && "bg-red-500/20 text-red-400"
              )}
            >
              {suggestions.complexity.charAt(0).toUpperCase() + suggestions.complexity.slice(1)}
            </span>
          </div>

          {/* Suggestions List */}
          {suggestions.suggestions.length > 0 ? (
            <ul className="space-y-1.5">
              {suggestions.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <span>{getTypeIcon(suggestion.type)}</span>
                  <span>{suggestion.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-zinc-500">No specific suggestions.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
