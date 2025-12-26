"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Archive, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  icon?: "trash" | "archive" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon = "warning",
  isLoading = false,
}: ConfirmDialogProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const IconComponent = {
    trash: Trash2,
    archive: Archive,
    warning: AlertTriangle,
  }[icon];

  const iconColorClass = {
    danger: "text-red-500 bg-red-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    default: "text-blue-500 bg-blue-500/10",
  }[variant];

  const confirmButtonClass = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    default: "bg-primary hover:bg-primary/90 text-white",
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl p-6 shadow-2xl",
          "transform transition-all duration-200 ease-out",
          "animate-in fade-in zoom-in-95"
        )}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", iconColorClass)}>
          <IconComponent className="h-6 w-6" />
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              confirmButtonClass
            )}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
    props: Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">;
  }>({
    isOpen: false,
    resolve: null,
    props: { title: "", message: "" },
  });

  const confirm = React.useCallback(
    (props: Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">) => {
      return new Promise<boolean>((resolve) => {
        setState({ isOpen: true, resolve, props });
      });
    },
    []
  );

  const handleClose = React.useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const dialog = (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...state.props}
    />
  );

  return { confirm, dialog };
}
