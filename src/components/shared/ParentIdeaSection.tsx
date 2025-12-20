"use client";

/**
 * ParentIdeaSection Component
 * Allows assigning/changing the linked idea for a task
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Lightbulb, ChevronDown, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIdeas } from "@/lib/api/ideas";
import type { DbIdea } from "@/types/database";

interface ParentIdeaSectionProps {
  /** Current parent idea ID */
  ideaId: string | null;
  /** Callback when idea changes */
  onIdeaChange: (ideaId: string | null) => void;
  /** Custom class name */
  className?: string;
}

export function ParentIdeaSection({
  ideaId,
  onIdeaChange,
  className,
}: ParentIdeaSectionProps) {
  const [ideas, setIdeas] = useState<DbIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load active ideas on mount
  useEffect(() => {
    loadIdeas();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadIdeas() {
    setIsLoading(false);
    try {
      // Only load active ideas (accepted or doing)
      const data = await getIdeas({
        status: ["accepted", "doing"],
        archived: false,
      });
      setIdeas(data);
    } catch (error) {
      console.error("Error loading ideas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectIdea(selectedIdeaId: string | null) {
    onIdeaChange(selectedIdeaId);
    setShowDropdown(false);
    setSearchQuery("");
  }

  // Get current idea details
  const currentIdea = ideaId ? ideas.find((i) => i.id === ideaId) : null;

  // Filter ideas by search query
  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Lightbulb className="w-4 h-4 text-zinc-500" />
          Linked Idea
        </div>
      </div>

      {/* Current Selection */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm",
            "bg-bg-tertiary border border-border rounded-lg",
            "hover:border-border-hover transition-colors",
            "text-left"
          )}
        >
          <span className={currentIdea ? "text-foreground" : "text-muted-foreground"}>
            {isLoading
              ? "Loading..."
              : currentIdea
              ? currentIdea.title
              : "Not assigned"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              showDropdown && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Search input */}
            {ideas.length > 5 && (
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ideas..."
                  className="w-full px-3 py-1.5 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            )}

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto p-1">
              {/* Unassign option */}
              <button
                onClick={() => handleSelectIdea(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded",
                  "hover:bg-bg-hover transition-colors",
                  !ideaId && "bg-primary/10 text-primary"
                )}
              >
                <X className="w-4 h-4 text-muted-foreground" />
                <span>Not assigned</span>
              </button>

              {/* Divider */}
              {filteredIdeas.length > 0 && (
                <div className="h-px bg-border my-1" />
              )}

              {/* Ideas list */}
              {filteredIdeas.length === 0 && searchQuery && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No ideas match &quot;{searchQuery}&quot;
                </div>
              )}
              {filteredIdeas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => handleSelectIdea(idea.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded",
                    "hover:bg-bg-hover transition-colors group",
                    ideaId === idea.id && "bg-primary/10 text-primary"
                  )}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="flex-1 truncate">{idea.title}</span>
                  <Link
                    href={`/dashboard/ideas?selected=${idea.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                    title="View idea"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Link to linked idea when assigned */}
      {currentIdea && (
        <Link
          href={`/dashboard/ideas?selected=${currentIdea.id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
        >
          View idea
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
