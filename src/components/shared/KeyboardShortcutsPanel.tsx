"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ["g", "h"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["g", "i"], description: "Go to Ideas", category: "Navigation" },
  { keys: ["g", "d"], description: "Go to Delivery Board", category: "Navigation" },
  { keys: ["g", "m"], description: "Go to Matrix", category: "Navigation" },
  { keys: ["g", "t"], description: "Go to Time Audit", category: "Navigation" },
  { keys: ["g", "s"], description: "Go to Settings", category: "Navigation" },

  // Global Actions
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Global" },
  { keys: ["Cmd", "K"], description: "Open command palette", category: "Global" },
  { keys: ["Cmd", "B"], description: "Toggle sidebar", category: "Global" },
  { keys: ["Esc"], description: "Close modal/panel", category: "Global" },

  // Ideas
  { keys: ["n"], description: "New idea", category: "Ideas" },
  { keys: ["e"], description: "Edit selected idea", category: "Ideas" },
  { keys: ["Delete"], description: "Delete selected idea", category: "Ideas" },
  { keys: ["a"], description: "Accept idea", category: "Ideas" },

  // Table Navigation
  { keys: ["j"], description: "Move down", category: "Table" },
  { keys: ["k"], description: "Move up", category: "Table" },
  { keys: ["Enter"], description: "Open selected item", category: "Table" },
  { keys: ["x"], description: "Toggle selection", category: "Table" },
  { keys: ["Shift", "a"], description: "Select all", category: "Table" },
  { keys: ["Shift", "d"], description: "Deselect all", category: "Table" },
];

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-xs font-medium bg-bg-secondary border border-border rounded">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsPanel({
  isOpen,
  onClose,
}: KeyboardShortcutsPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen && !isVisible) return null;

  // Group shortcuts by category
  const categories = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          isVisible && isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[80vh] bg-bg-elevated border border-border rounded-xl shadow-2xl transition-all duration-200 overflow-hidden",
          isVisible && isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {Object.entries(categories).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center gap-1">
                            <ShortcutKey>{key}</ShortcutKey>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-bg-secondary text-center">
          <p className="text-xs text-muted-foreground">
            Press <ShortcutKey>?</ShortcutKey> anytime to show this panel
          </p>
        </div>
      </div>
    </>
  );
}

// Hook to manage keyboard shortcuts panel
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
