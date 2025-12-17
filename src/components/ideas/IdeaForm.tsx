"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createIdea, updateIdea } from "@/lib/api/ideas";
import type { DbIdea, IdeaStatus, IdeaFrequency } from "@/types/database";

interface IdeaFormProps {
  idea?: DbIdea | null;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "evaluating", label: "Evaluating" },
  { value: "prioritised", label: "Prioritised" },
  { value: "converting", label: "Converting" },
  { value: "archived", label: "Archived" },
];

const FREQUENCY_OPTIONS: { value: IdeaFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "adhoc", label: "Ad-hoc" },
];

export function IdeaForm({ idea, onClose, onSuccess }: IdeaFormProps) {
  const isEditing = !!idea;

  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [status, setStatus] = useState<IdeaStatus>(idea?.status || "new");
  const [frequency, setFrequency] = useState<IdeaFrequency | "">(idea?.frequency || "");
  const [timeSpent, setTimeSpent] = useState(idea?.time_spent?.toString() || "");
  const [owner, setOwner] = useState(idea?.owner || "");
  const [painPoints, setPainPoints] = useState(idea?.pain_points || "");
  const [desiredOutcome, setDesiredOutcome] = useState(idea?.desired_outcome || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        frequency: frequency || null,
        time_spent: timeSpent ? parseInt(timeSpent, 10) : null,
        owner: owner.trim() || null,
        pain_points: painPoints.trim() || null,
        desired_outcome: desiredOutcome.trim() || null,
      };

      if (isEditing && idea) {
        await updateIdea(idea.id, data);
      } else {
        await createIdea(data);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-elevated rounded-xl shadow-xl border border-border">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-bg-elevated">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Idea" : "New Idea"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the automation idea?"
              className="input w-full"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the idea in more detail..."
              className="input w-full min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          {/* Two column layout */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                className="input w-full"
                disabled={loading}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium mb-1.5">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IdeaFrequency | "")}
                className="input w-full"
                disabled={loading}
              >
                <option value="">Select frequency...</option>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Spent */}
            <div>
              <label htmlFor="timeSpent" className="block text-sm font-medium mb-1.5">
                Time per task (minutes)
              </label>
              <input
                id="timeSpent"
                type="number"
                min="0"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                placeholder="e.g., 30"
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Owner */}
            <div>
              <label htmlFor="owner" className="block text-sm font-medium mb-1.5">
                Owner
              </label>
              <input
                id="owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Who does this task?"
                className="input w-full"
                disabled={loading}
              />
            </div>
          </div>

          {/* Pain Points */}
          <div>
            <label htmlFor="painPoints" className="block text-sm font-medium mb-1.5">
              Pain Points
            </label>
            <textarea
              id="painPoints"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              placeholder="What problems does this manual process cause?"
              className="input w-full min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          {/* Desired Outcome */}
          <div>
            <label htmlFor="desiredOutcome" className="block text-sm font-medium mb-1.5">
              Desired Outcome
            </label>
            <textarea
              id="desiredOutcome"
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="What would the ideal automated solution look like?"
              className="input w-full min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Idea"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
