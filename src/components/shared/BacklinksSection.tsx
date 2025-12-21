"use client";

/**
 * BacklinksSection Component
 * Shows links that point TO this idea/task from other entities
 * Read-only - users can't delete backlinks from here (they must go to the source)
 * V1.4: Bidirectional linking feature
 */

import { useState, useEffect } from "react";
import { Link2, ChevronDown, ChevronRight, Lightbulb, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getIdeaBacklinks,
  getTaskBacklinks,
  type BacklinkInfo,
} from "@/lib/api/links";

interface BacklinksSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
}

export function BacklinksSection({
  ideaId,
  taskId,
  className,
}: BacklinksSectionProps) {
  const router = useRouter();
  const [backlinks, setBacklinks] = useState<BacklinkInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load backlinks on mount
  useEffect(() => {
    loadBacklinks();
  }, [ideaId, taskId]);

  async function loadBacklinks() {
    setIsLoading(true);
    try {
      let data: BacklinkInfo[] = [];
      if (ideaId) {
        data = await getIdeaBacklinks(ideaId);
      } else if (taskId) {
        data = await getTaskBacklinks(taskId);
      }
      setBacklinks(data);
    } catch (error) {
      console.error("Error loading backlinks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Navigate to source entity
  function handleBacklinkClick(backlink: BacklinkInfo) {
    if (backlink.sourceType === "idea") {
      router.push(`/dashboard/ideas?selected=${backlink.sourceId}`);
    } else {
      router.push(`/dashboard/delivery?task=${backlink.sourceId}`);
    }
  }

  // Don't render if no backlinks
  if (!isLoading && backlinks.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header - Collapsible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors w-full"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <Link2 className="w-4 h-4" />
        Backlinks
        {backlinks.length > 0 && (
          <span className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">
            {backlinks.length}
          </span>
        )}
      </button>

      {/* Backlinks List */}
      {!isCollapsed && (
        <div className="space-y-1 pl-6">
          {isLoading ? (
            <div className="text-xs text-foreground-muted py-2">Loading...</div>
          ) : (
            backlinks.map((backlink) => (
              <button
                key={backlink.link.id}
                onClick={() => handleBacklinkClick(backlink)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded hover:bg-bg-hover transition-colors group"
              >
                {/* Source type icon */}
                {backlink.sourceType === "idea" ? (
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />
                )}

                {/* Source title */}
                <span className="flex-1 truncate">{backlink.sourceTitle}</span>

                {/* Arrow indicator */}
                <span className="text-foreground-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            ))
          )}

          {/* Help text */}
          {backlinks.length > 0 && (
            <p className="text-[10px] text-foreground-muted pt-1 px-2">
              Click to navigate. To remove, edit the source item.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
