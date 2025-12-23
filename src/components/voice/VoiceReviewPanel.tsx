"use client";

import { Sparkles, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedIdea } from "@/types/voice";

interface VoiceReviewPanelProps {
  idea: GeneratedIdea;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  className?: string;
}

/**
 * Review panel for AI-generated ideas from voice input
 * Allows user to save, edit, or discard the generated idea
 */
export function VoiceReviewPanel({
  idea,
  onSave,
  onDiscard,
  isSaving,
  className,
}: VoiceReviewPanelProps) {
  return (
    <div
      className={cn(
        "p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10",
        "border border-cyan-500/20 rounded-lg space-y-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI Generated Idea
        </div>
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="p-1 text-foreground-muted hover:text-foreground rounded transition-colors"
          aria-label="Discard idea"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Generated content */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-foreground-muted mb-1">
            Title
          </label>
          <div className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-foreground">
            {idea.title}
          </div>
        </div>

        <div>
          <label className="block text-xs text-foreground-muted mb-1">
            Description
          </label>
          <div className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap">
            {idea.description}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            "px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors",
            "bg-success text-white hover:bg-success/80",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              Save Idea
            </>
          )}
        </button>
      </div>
    </div>
  );
}
