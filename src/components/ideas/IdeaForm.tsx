"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, Tag, Plus, Square, CheckSquare } from "lucide-react";
import { createIdea, updateIdea } from "@/lib/api/ideas";
import { getLabels, addIdeaLabel, getIdeaLabels, createLabel } from "@/lib/api/labels";
import type { DbIdea, DbLabel, IdeaStatus, IdeaFrequency, IdeaCategory, EffortEstimate, PlanningHorizon } from "@/types/database";
import { IDEA_CATEGORY_OPTIONS, LABEL_COLOR_CLASSES, LABEL_COLORS } from "@/types/database";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface IdeaFormProps {
  idea?: DbIdea | null;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "evaluating", label: "Evaluating" },
  { value: "accepted", label: "Accepted" },
  { value: "doing", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "parked", label: "Parked" },
  { value: "dropped", label: "Dropped" },
];

const FREQUENCY_OPTIONS: { value: IdeaFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "adhoc", label: "Ad-hoc" },
];

const EFFORT_OPTIONS: { value: EffortEstimate; label: string }[] = [
  { value: "trivial", label: "Trivial" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
];

const HORIZON_OPTIONS: { value: NonNullable<PlanningHorizon>; label: string }[] = [
  { value: "now", label: "Now" },
  { value: "next", label: "Next" },
  { value: "later", label: "Later" },
];

export function IdeaForm({ idea, onClose, onSuccess }: IdeaFormProps) {
  const isEditing = !!idea;

  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [status, setStatus] = useState<IdeaStatus>(idea?.status || "new");
  const [frequency, setFrequency] = useState<IdeaFrequency | "">(idea?.frequency || "");
  const [timeSpent, setTimeSpent] = useState(idea?.time_spent?.toString() || "");
  const [category, setCategory] = useState<IdeaCategory | "">(idea?.category || "");
  const [owner, setOwner] = useState(idea?.owner || "");
  const [painPoints, setPainPoints] = useState(idea?.pain_points || "");
  const [desiredOutcome, setDesiredOutcome] = useState(idea?.desired_outcome || "");
  const [effortEstimate, setEffortEstimate] = useState<EffortEstimate | "">(idea?.effort_estimate || "");
  const [horizon, setHorizon] = useState<PlanningHorizon | "">(idea?.horizon || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Labels state
  const [availableLabels, setAvailableLabels] = useState<DbLabel[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[2]); // Blue default
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Fetch available labels on mount
  useEffect(() => {
    async function fetchLabels() {
      setLabelsLoading(true);
      try {
        const labels = await getLabels();
        setAvailableLabels(labels);

        // If editing, also fetch assigned labels
        if (idea?.id) {
          const ideaLabels = await getIdeaLabels(idea.id);
          setSelectedLabelIds(ideaLabels.map(l => l.id));
        }
      } catch (err) {
        console.error("Failed to fetch labels:", err);
      } finally {
        setLabelsLoading(false);
      }
    }
    fetchLabels();
  }, [idea?.id]);

  // Handle creating a new label
  const handleCreateLabel = async () => {
    if (isCreatingLabel) return;
    setIsCreatingLabel(true);
    try {
      const newLabel = await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
      });
      setAvailableLabels([...availableLabels, newLabel]);
      setSelectedLabelIds([...selectedLabelIds, newLabel.id]);
      setNewLabelName("");
      setNewLabelColor(LABEL_COLORS[2]);
      setShowCreateLabel(false);
    } catch (err) {
      console.error("Failed to create label:", err);
    } finally {
      setIsCreatingLabel(false);
    }
  };

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
        category: category || null,
        frequency: frequency || null,
        time_spent: timeSpent ? parseInt(timeSpent, 10) : null,
        owner: owner.trim() || null,
        pain_points: painPoints.trim() || null,
        desired_outcome: desiredOutcome.trim() || null,
        effort_estimate: effortEstimate || null,
        horizon: horizon || null,
      };

      if (isEditing && idea) {
        await updateIdea(idea.id, data);
        // Note: For editing, labels are managed separately in the slider
        // We could add label syncing here if needed
      } else {
        const createdIdea = await createIdea(data);
        // Assign selected labels to the newly created idea
        if (selectedLabelIds.length > 0) {
          await Promise.all(
            selectedLabelIds.map(labelId => addIdeaLabel(createdIdea.id, labelId))
          );
        }
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
      <div data-testid="idea-form" className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-bg-elevated rounded-xl shadow-xl border border-border">
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
              data-testid="idea-form-title"
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

          {/* Properties Grid - matches slider fields */}
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

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1.5">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IdeaCategory | "")}
                className="input w-full"
                disabled={loading}
              >
                <option value="">Select category...</option>
                {IDEA_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Effort */}
            <div>
              <label htmlFor="effort" className="block text-sm font-medium mb-1.5">
                Effort
              </label>
              <select
                id="effort"
                value={effortEstimate}
                onChange={(e) => setEffortEstimate(e.target.value as EffortEstimate | "")}
                className="input w-full"
                disabled={loading}
              >
                <option value="">Select effort...</option>
                {EFFORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Horizon */}
            <div>
              <label htmlFor="horizon" className="block text-sm font-medium mb-1.5">
                Horizon
              </label>
              <select
                id="horizon"
                value={horizon || ""}
                onChange={(e) => setHorizon(e.target.value as PlanningHorizon | "")}
                className="input w-full"
                disabled={loading}
              >
                <option value="">Select horizon...</option>
                {HORIZON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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

            {/* Labels */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1.5">
                Labels
              </label>
              <div
                className="input w-full min-h-[42px] flex flex-wrap items-center gap-1.5 cursor-pointer"
                onClick={() => !loading && setShowLabelsMenu(!showLabelsMenu)}
              >
                {labelsLoading ? (
                  <span className="text-muted-foreground text-sm">Loading...</span>
                ) : selectedLabelIds.length === 0 ? (
                  <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Add labels...
                  </span>
                ) : (
                  <>
                    {selectedLabelIds.map((labelId) => {
                      const label = availableLabels.find((l) => l.id === labelId);
                      if (!label) return null;
                      const bgClass = LABEL_COLOR_CLASSES[label.color] || "";
                      return (
                        <span
                          key={label.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white min-w-[1.5rem] ${bgClass}`}
                          style={!bgClass ? { backgroundColor: label.color } : undefined}
                        >
                          {label.name || "\u00A0"}
                        </span>
                      );
                    })}
                    <Plus className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  </>
                )}
              </div>

              {/* Labels dropdown menu - matches slider style */}
              {showLabelsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowLabelsMenu(false);
                      setShowCreateLabel(false);
                    }}
                  />
                  <div className="absolute left-0 top-full mt-1 z-20 w-full bg-bg-elevated border border-border rounded-lg shadow-xl overflow-hidden">
                    {showCreateLabel ? (
                      /* Create label form */
                      <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Create Label</span>
                          <button
                            type="button"
                            onClick={() => setShowCreateLabel(false)}
                            className="p-1 rounded hover:bg-bg-hover text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="Label name (optional)"
                          className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateLabel();
                            }
                            if (e.key === "Escape") setShowCreateLabel(false);
                          }}
                        />
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Colour</div>
                          <ColorPicker value={newLabelColor} onChange={setNewLabelColor} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowCreateLabel(false)}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateLabel}
                            disabled={isCreatingLabel}
                            className="px-4 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                          >
                            {isCreatingLabel ? "Creating..." : "Create"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                          <span className="text-sm font-medium">Labels</span>
                          <button
                            type="button"
                            onClick={() => setShowLabelsMenu(false)}
                            className="p-1 rounded hover:bg-bg-hover text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Labels list */}
                        <div className="p-2 max-h-48 overflow-y-auto">
                          {availableLabels.length === 0 ? (
                            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                              No labels yet
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {availableLabels.map((label) => {
                                const isSelected = selectedLabelIds.includes(label.id);
                                const bgClass = LABEL_COLOR_CLASSES[label.color] || "";
                                return (
                                  <div key={label.id} className="flex items-center gap-2">
                                    {/* Checkbox */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSelected) {
                                          setSelectedLabelIds(selectedLabelIds.filter((id) => id !== label.id));
                                        } else {
                                          setSelectedLabelIds([...selectedLabelIds, label.id]);
                                        }
                                      }}
                                      className="p-1.5 rounded hover:bg-bg-hover text-muted-foreground hover:text-foreground"
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                      ) : (
                                        <Square className="w-5 h-5" />
                                      )}
                                    </button>
                                    {/* Full-width colour bar */}
                                    <div
                                      className={`flex-1 px-3 py-2 rounded text-sm font-medium text-white truncate ${bgClass}`}
                                      style={!bgClass ? { backgroundColor: label.color } : undefined}
                                    >
                                      {label.name || "\u00A0"}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Create new label option */}
                        <div className="border-t border-border p-2">
                          <button
                            type="button"
                            onClick={() => setShowCreateLabel(true)}
                            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-hover rounded transition-colors"
                          >
                            Create a new label
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Section */}
          <div className="border border-border rounded-lg">
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-bg-hover rounded-lg"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>More Details</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            )}
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
              data-testid="idea-form-submit"
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
