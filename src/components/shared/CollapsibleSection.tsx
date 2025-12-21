"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Whether section is open by default */
  defaultOpen?: boolean;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Content to render */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Whether to show border-top */
  showBorder?: boolean;
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  badge,
  children,
  className,
  showBorder = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(showBorder && "pt-4 border-t border-border", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 hover:bg-bg-hover rounded-lg px-2 -mx-2 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium">{title}</span>
          {badge !== undefined && badge !== null && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      <div
        id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
