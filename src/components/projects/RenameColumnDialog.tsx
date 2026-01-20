"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface RenameColumnDialogProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
}

export function RenameColumnDialog({
  isOpen,
  currentName,
  onClose,
  onRename,
}: RenameColumnDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isOpen, currentName]);

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
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onRename(trimmedName);
      onClose();
    } catch (error) {
      console.error("Failed to rename column:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Rename Column
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="Column name"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-elevated text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            maxLength={50}
          />

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
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
              disabled={isLoading || !name.trim() || name.trim() === currentName}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
