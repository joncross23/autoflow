"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { ColumnColor } from "@/types/database";

interface ChangeColorDialogProps {
  isOpen: boolean;
  currentColor: ColumnColor;
  onClose: () => void;
  onChange: (newColor: ColumnColor) => Promise<void>;
}

const COLUMN_COLORS: { value: ColumnColor; label: string; hex: string }[] = [
  { value: "slate", label: "Slate", hex: "#64748B" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "orange", label: "Orange", hex: "#F59E0B" },
  { value: "purple", label: "Purple", hex: "#A855F7" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
];

export function ChangeColorDialog({
  isOpen,
  currentColor,
  onClose,
  onChange,
}: ChangeColorDialogProps) {
  const [selectedColor, setSelectedColor] = useState<ColumnColor>(currentColor);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(currentColor);
    }
  }, [isOpen, currentColor]);

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

  const handleSubmit = async () => {
    if (selectedColor === currentColor) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onChange(selectedColor);
      onClose();
    } catch (error) {
      console.error("Failed to change column colour:", error);
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
          Change Column Colour
        </h2>

        {/* Color Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {COLUMN_COLORS.map((color) => {
            const isSelected = selectedColor === color.value;
            return (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:bg-bg-hover disabled:opacity-50"
                style={{
                  borderColor: isSelected ? color.hex : "var(--border-color)",
                  borderWidth: isSelected ? "2px" : "1px",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full relative"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground-muted">{color.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-bg-tertiary text-foreground hover:bg-bg-hover disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedColor === currentColor}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Change Colour"}
          </button>
        </div>
      </div>
    </div>
  );
}
