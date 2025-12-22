"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
  sm: "max-w-sm w-full sm:w-[320px]",
  md: "max-w-md w-full sm:w-[400px]",
  lg: "max-w-lg w-full sm:w-[500px]",
  xl: "max-w-[1000px] w-full sm:w-[50vw]",
};

export function SlideOutPanel({
  isOpen,
  onClose,
  title,
  children,
  width = "xl",
}: SlideOutPanelProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed top-0 right-0 h-full z-50 shadow-2xl",
        "transform transition-transform duration-300 ease-in-out",
        widthClasses[width],
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border-color)",
      }}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-65px)] overflow-y-auto px-6 py-4">
        {children}
      </div>
    </div>
  );
}
