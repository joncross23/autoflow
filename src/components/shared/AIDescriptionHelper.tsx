"use client";

/**
 * AIDescriptionHelper Component
 * Generates task descriptions from brief notes using AI
 * V1.4: Phase 4 - AI Description feature
 */

import { useState } from "react";
import { Sparkles, Loader2, X, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIDescriptionHelperProps {
  /** Task ID for API call */
  taskId: string;
  /** Task title for context */
  taskTitle: string;
  /** Current description value */
  currentDescription: string;
  /** Callback when description is accepted */
  onAccept: (description: string) => void;
  /** Custom class name */
  className?: string;
}

export function AIDescriptionHelper({
  taskId,
  taskTitle,
  currentDescription,
  onAccept,
  className,
}: AIDescriptionHelperProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || !taskTitle.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedDescription(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
    } catch (err) {
      console.error("Error generating description:", err);
      setError(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    if (generatedDescription) {
      onAccept(generatedDescription);
      resetState();
    }
  }

  function handleRegenerate() {
    setGeneratedDescription(null);
    handleGenerate();
  }

  function resetState() {
    setShowPrompt(false);
    setPrompt("");
    setGeneratedDescription(null);
    setError(null);
  }

  // Don't show if description already exists
  if (currentDescription && currentDescription.trim().length > 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {!showPrompt ? (
        // Trigger button
        <button
          onClick={() => setShowPrompt(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create with AI
        </button>
      ) : (
        // Prompt form
        <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Create Description with AI
            </div>
            <button
              onClick={resetState}
              className="p-1 text-foreground-muted hover:text-foreground rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-error bg-error/10 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {!generatedDescription ? (
            // Input form
            <>
              <div>
                <label className="block text-xs text-foreground-muted mb-1.5">
                  Brief notes (AI will expand these)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., login form validation, check email format, show error messages"
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleGenerate();
                    }
                    if (e.key === "Escape") {
                      resetState();
                    }
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={resetState}
                  className="px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !taskTitle.trim() || isGenerating}
                  className="px-3 py-1.5 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-foreground-muted">
                Tip: Press <kbd className="px-1 py-0.5 bg-bg-tertiary rounded">⌘ Enter</kbd> to generate
              </p>
            </>
          ) : (
            // Generated result
            <>
              <div>
                <label className="block text-xs text-foreground-muted mb-1.5">
                  Generated description
                </label>
                <div className="p-3 bg-bg-tertiary border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {generatedDescription}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                  Regenerate
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={resetState}
                    className="px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-3 py-1.5 text-xs bg-success text-white rounded hover:bg-success/80 flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Use this
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
