"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { createGlobalColumn } from "@/lib/api/columns";
import type { ColumnColor } from "@/types/database";

interface CreateColumnButtonProps {
  onColumnCreated: () => void;
}

const COLUMN_COLORS: { value: ColumnColor; label: string; hex: string }[] = [
  { value: "slate", label: "Slate", hex: "#64748B" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "orange", label: "Orange", hex: "#F59E0B" },
  { value: "purple", label: "Purple", hex: "#14B8A6" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
];

export function CreateColumnButton({ onColumnCreated }: CreateColumnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<ColumnColor>("slate");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setColor("slate");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isLoading) return;

    setIsLoading(true);
    try {
      await createGlobalColumn(trimmedName, color);
      setIsOpen(false);
      onColumnCreated();
    } catch (error) {
      console.error("Failed to create column:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={!isLoading ? () => setIsOpen(false) : undefined}
        />

        {/* Dialog */}
        <div className="relative w-full max-w-md rounded-xl p-6 shadow-2xl bg-bg-secondary border border-border animate-in fade-in zoom-in-95">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-bg-hover disabled:opacity-50 text-foreground-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title */}
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Create New Column
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Column Name */}
            <div className="mb-4">
              <label htmlFor="column-name" className="block text-sm font-medium text-foreground mb-2">
                Column name
              </label>
              <input
                ref={inputRef}
                id="column-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Testing, Deployed"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-elevated text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                maxLength={50}
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Colour
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLUMN_COLORS.map((colorOption) => {
                  const isSelected = color === colorOption.value;
                  return (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      disabled={isLoading}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all hover:bg-bg-hover disabled:opacity-50"
                      style={{
                        borderColor: isSelected ? colorOption.hex : "var(--border-color)",
                        borderWidth: isSelected ? "2px" : "1px",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full relative"
                        style={{ backgroundColor: colorOption.hex }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-foreground-muted leading-none">
                        {colorOption.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-bg-tertiary text-foreground hover:bg-bg-hover disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Column"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="
        flex items-center justify-center gap-2 w-[85vw] sm:w-[280px] min-w-[85vw] sm:min-w-[280px] h-[120px]
        bg-bg-secondary/50 hover:bg-bg-secondary rounded-xl
        border-2 border-dashed border-border hover:border-primary
        text-foreground-muted hover:text-primary
        transition-all duration-150
        snap-center sm:snap-align-none
        shrink-0
      "
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-medium">Add Column</span>
    </button>
  );
}
