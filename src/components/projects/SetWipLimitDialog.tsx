"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SetWipLimitDialogProps {
  isOpen: boolean;
  currentLimit: number | null;
  onClose: () => void;
  onSet: (limit: number | null) => Promise<void>;
}

export function SetWipLimitDialog({
  isOpen,
  currentLimit,
  onClose,
  onSet,
}: SetWipLimitDialogProps) {
  const [limit, setLimit] = useState<string>(currentLimit?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLimit(currentLimit?.toString() || "");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isOpen, currentLimit]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLimit = limit.trim();
    const numLimit = trimmedLimit ? parseInt(trimmedLimit, 10) : null;

    // Check if value actually changed
    if (numLimit === currentLimit) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSet(numLimit);
      onClose();
    } catch (error) {
      console.error("Failed to set WIP limit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLimit = async () => {
    setIsLoading(true);
    try {
      await onSet(null);
      onClose();
    } catch (error) {
      console.error("Failed to remove WIP limit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const parsedLimit = limit.trim() ? parseInt(limit, 10) : null;
  const isValid = limit.trim() === "" || (!isNaN(parsedLimit!) && parsedLimit! > 0);
  const hasChanged = parsedLimit !== currentLimit;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl p-6 shadow-2xl bg-bg-secondary border border-border animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-bg-hover disabled:opacity-50 text-foreground-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-2 text-foreground">
          Set WIP Limit
        </h2>

        <p className="text-sm text-foreground-muted mb-4">
          Work in Progress (WIP) limit helps manage workflow by limiting the number of tasks in this column.
          Leave empty for no limit.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="wip-limit" className="block text-sm font-medium text-foreground mb-2">
              Maximum number of tasks
            </label>
            <input
              ref={inputRef}
              id="wip-limit"
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              disabled={isLoading}
              placeholder="No limit"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-elevated text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            {!isValid && (
              <p className="text-xs text-error mt-1">Please enter a positive number</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            {currentLimit !== null && (
              <button
                type="button"
                onClick={handleRemoveLimit}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-error hover:bg-error/10 disabled:opacity-50"
              >
                Remove Limit
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-bg-tertiary text-foreground hover:bg-bg-hover disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !isValid || !hasChanged}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
