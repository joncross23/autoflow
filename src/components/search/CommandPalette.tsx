"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  Loader2,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { search, getRecentItems, type SearchResult } from "@/lib/api/search";
import { StatusBadge } from "@/components/ideas/StatusBadge";
import type { IdeaStatus } from "@/types/database";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      loadRecentItems();
    } else {
      setIsVisible(false);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const loadRecentItems = async () => {
    const { ideas, tasks } = await getRecentItems(5);
    setResults([...ideas, ...tasks]);
  };

  // Debounced search with useEffect
  useEffect(() => {
    if (!query.trim()) {
      loadRecentItems();
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { ideas, tasks } = await search(query);
        setResults([...ideas, ...tasks]);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === "idea") {
      router.push(`/dashboard/ideas?selected=${result.id}`);
    } else {
      // For tasks, navigate to the idea if it has one, otherwise to delivery
      if (result.ideaId) {
        router.push(`/dashboard/ideas?selected=${result.ideaId}`);
      } else {
        router.push("/dashboard/delivery");
      }
    }
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-150",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={cn(
          "fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg transition-all duration-150",
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        )}
      >
        <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {loading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search ideas and tasks..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-bg-tertiary rounded">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {query ? "No results found" : "Start typing to search..."}
              </div>
            ) : (
              <div className="py-2">
                {/* Group by type */}
                {results.some((r) => r.type === "idea") && (
                  <>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Ideas
                    </div>
                    {results
                      .filter((r) => r.type === "idea")
                      .map((result, idx) => {
                        const globalIdx = results.indexOf(result);
                        return (
                          <ResultItem
                            key={result.id}
                            result={result}
                            selected={selectedIndex === globalIdx}
                            onSelect={() => handleSelect(result)}
                            onHover={() => setSelectedIndex(globalIdx)}
                          />
                        );
                      })}
                  </>
                )}

                {results.some((r) => r.type === "task") && (
                  <>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">
                      Tasks
                    </div>
                    {results
                      .filter((r) => r.type === "task")
                      .map((result) => {
                        const globalIdx = results.indexOf(result);
                        return (
                          <ResultItem
                            key={result.id}
                            result={result}
                            selected={selectedIndex === globalIdx}
                            onSelect={() => handleSelect(result)}
                            onHover={() => setSelectedIndex(globalIdx)}
                          />
                        );
                      })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-bg-secondary text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">↵</kbd>
                <span>to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded">esc</kbd>
              <span>to close</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function ResultItem({
  result,
  selected,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-bg-hover"
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      {/* Icon */}
      <span
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
          result.type === "idea"
            ? "bg-blue-500/15 text-blue-500"
            : "bg-green-500/15 text-green-500"
        )}
      >
        {result.type === "idea" ? (
          <Lightbulb className="h-4 w-4" />
        ) : (
          <CheckSquare className="h-4 w-4" />
        )}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{result.title}</span>
          {result.type === "idea" && (
            <StatusBadge
              status={result.status as IdeaStatus}
              size="sm"
            />
          )}
          {result.type === "task" && result.status === "completed" && (
            <span className="text-xs text-muted-foreground">(completed)</span>
          )}
        </div>
        {result.ideaTitle && (
          <div className="text-xs text-muted-foreground truncate">
            in {result.ideaTitle}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight
        className={cn(
          "h-4 w-4 text-muted-foreground shrink-0 transition-opacity",
          selected ? "opacity-100" : "opacity-0"
        )}
      />
    </button>
  );
}

/**
 * Global keyboard shortcut hook for opening command palette
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
