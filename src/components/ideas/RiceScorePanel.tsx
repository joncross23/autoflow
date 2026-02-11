"use client";

import { useState, useEffect, useMemo } from "react";
import { Calculator, HelpCircle, Loader2, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateRiceScore, clearRiceScore, calculateRiceScore } from "@/lib/api/ideas";
import type { DbIdea, RiceImpact } from "@/types/database";
import { RICE_IMPACT_LABELS } from "@/types/database";

interface RiceScorePanelProps {
  idea: DbIdea;
  onUpdate: (idea: DbIdea) => void;
}

const REACH_OPTIONS = [
  { value: 1, label: "1 - Very few" },
  { value: 2, label: "2" },
  { value: 3, label: "3 - Some" },
  { value: 4, label: "4" },
  { value: 5, label: "5 - Moderate" },
  { value: 6, label: "6" },
  { value: 7, label: "7 - Many" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10 - Everyone" },
];

const IMPACT_OPTIONS: { value: RiceImpact; label: string; description: string }[] = [
  { value: 0.25, label: "Minimal", description: "Barely noticeable improvement" },
  { value: 0.5, label: "Low", description: "Small but noticeable improvement" },
  { value: 1, label: "Medium", description: "Clear, measurable improvement" },
  { value: 2, label: "High", description: "Significant improvement" },
  { value: 3, label: "Massive", description: "Game-changing impact" },
];

const EFFORT_OPTIONS = [
  { value: 1, label: "1 - A few hours" },
  { value: 2, label: "2 - Half a day" },
  { value: 3, label: "3 - 1-2 days" },
  { value: 4, label: "4 - 3-5 days" },
  { value: 5, label: "5 - 1 week" },
  { value: 6, label: "6 - 2 weeks" },
  { value: 7, label: "7 - 3-4 weeks" },
  { value: 8, label: "8 - 1-2 months" },
  { value: 9, label: "9 - 2-3 months" },
  { value: 10, label: "10 - Quarter+" },
];

export function RiceScorePanel({ idea, onUpdate }: RiceScorePanelProps) {
  const [reach, setReach] = useState<number | null>(idea.rice_reach);
  const [impact, setImpact] = useState<RiceImpact | null>(idea.rice_impact);
  const [confidence, setConfidence] = useState<number | null>(idea.rice_confidence);
  const [effort, setEffort] = useState<number | null>(idea.rice_effort);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Sync with idea changes
  useEffect(() => {
    setReach(idea.rice_reach);
    setImpact(idea.rice_impact);
    setConfidence(idea.rice_confidence);
    setEffort(idea.rice_effort);
  }, [idea]);

  // Calculate preview score
  const previewScore = useMemo(() => {
    if (!reach || !impact || confidence === null || !effort) return null;
    return calculateRiceScore({ reach, impact, confidence, effort });
  }, [reach, impact, confidence, effort]);

  const hasChanges = useMemo(() => {
    return (
      reach !== idea.rice_reach ||
      impact !== idea.rice_impact ||
      confidence !== idea.rice_confidence ||
      effort !== idea.rice_effort
    );
  }, [reach, impact, confidence, effort, idea]);

  const hasScore = idea.rice_score !== null;
  const isComplete = reach && impact && confidence !== null && effort;

  const handleSave = async () => {
    if (!reach || !impact || confidence === null || !effort) return;

    setSaving(true);
    try {
      const updated = await updateRiceScore(idea.id, {
        reach,
        impact,
        confidence,
        effort,
      });
      onUpdate(updated);
    } catch (error) {
      console.error("Failed to save RICE score:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      const updated = await clearRiceScore(idea.id);
      onUpdate(updated);
      setReach(null);
      setImpact(null);
      setConfidence(null);
      setEffort(null);
    } catch (error) {
      console.error("Failed to clear RICE score:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="font-medium">RICE Score</h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 rounded hover:bg-bg-hover text-muted-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Score Display */}
        {(previewScore !== null || idea.rice_score !== null) && (
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-2xl font-bold",
              hasChanges ? "text-muted-foreground" : "text-primary"
            )}>
              {hasChanges ? previewScore : idea.rice_score}
            </span>
            {hasChanges && (
              <span className="text-xs text-muted-foreground">(unsaved)</span>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {showHelp && (
        <div className="text-xs text-muted-foreground bg-bg-tertiary rounded-lg p-3 space-y-1">
          <p><strong>RICE</strong> = (Reach × Impact × Confidence%) / Effort</p>
          <p>• <strong>Reach:</strong> How many users/processes will this affect?</p>
          <p>• <strong>Impact:</strong> How significant is the improvement per instance?</p>
          <p>• <strong>Confidence:</strong> How certain are you about these estimates?</p>
          <p>• <strong>Effort:</strong> How much work is required (person-weeks)?</p>
        </div>
      )}

      {/* Score Components */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reach */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Reach (1-10)
          </label>
          <select
            value={reach || ""}
            onChange={(e) => setReach(e.target.value ? Number(e.target.value) : null)}
            className="input input-sm w-full"
          >
            <option value="">Select...</option>
            {REACH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Impact */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Impact
          </label>
          <select
            value={impact || ""}
            onChange={(e) => setImpact(e.target.value ? Number(e.target.value) as RiceImpact : null)}
            className="input input-sm w-full"
          >
            <option value="">Select...</option>
            {IMPACT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value}x)
              </option>
            ))}
          </select>
        </div>

        {/* Confidence */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Confidence ({confidence ?? 0}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={confidence ?? 50}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Effort */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Effort (person-weeks)
          </label>
          <select
            value={effort || ""}
            onChange={(e) => setEffort(e.target.value ? Number(e.target.value) : null)}
            className="input input-sm w-full"
          >
            <option value="">Select...</option>
            {EFFORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {isComplete ? (
            hasScore ? "Score calculated automatically" : "Complete all fields to calculate"
          ) : (
            `${[!reach && "Reach", !impact && "Impact", confidence === null && "Confidence", !effort && "Effort"].filter(Boolean).join(", ")} needed`
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasScore && (
            <button
              onClick={handleClear}
              disabled={saving}
              className="btn btn-sm btn-ghost text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Clear
            </button>
          )}

          {hasChanges && isComplete && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-sm btn-primary"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Score"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
