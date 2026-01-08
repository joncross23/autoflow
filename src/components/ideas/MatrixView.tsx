"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { DbIdea, RiceImpact } from "@/types/database";
import { RICE_IMPACT_LABELS } from "@/types/database";

interface MatrixViewProps {
  ideas: DbIdea[];
  onIdeaClick?: (idea: DbIdea) => void;
}

// Quadrant labels
const QUADRANTS = {
  topLeft: { label: "Quick Wins", description: "High impact, low effort", color: "text-green-500" },
  topRight: { label: "Major Projects", description: "High impact, high effort", color: "text-blue-500" },
  bottomLeft: { label: "Fill-ins", description: "Low impact, low effort", color: "text-yellow-500" },
  bottomRight: { label: "Time Sinks", description: "Low impact, high effort", color: "text-red-500" },
};

// Map RICE values to grid positions
function getImpactY(impact: RiceImpact | null): number {
  if (!impact) return 50; // Center if unknown
  // Impact: 0.25=10%, 0.5=25%, 1=50%, 2=75%, 3=90%
  const mapping: Record<RiceImpact, number> = {
    0.25: 10,
    0.5: 25,
    1: 50,
    2: 75,
    3: 90,
  };
  return mapping[impact] ?? 50;
}

function getEffortX(effort: number | null): number {
  if (!effort) return 50; // Center if unknown
  // Effort 1-10 maps to 5-95%
  return 5 + (effort - 1) * 10;
}

// Determine quadrant based on position
function getQuadrant(x: number, y: number): keyof typeof QUADRANTS {
  if (y >= 50 && x < 50) return "topLeft";
  if (y >= 50 && x >= 50) return "topRight";
  if (y < 50 && x < 50) return "bottomLeft";
  return "bottomRight";
}

interface IdeaPoint {
  idea: DbIdea;
  x: number;
  y: number;
  quadrant: keyof typeof QUADRANTS;
  hasScore: boolean;
}

export function MatrixView({ ideas, onIdeaClick }: MatrixViewProps) {
  const [hoveredIdea, setHoveredIdea] = useState<string | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<keyof typeof QUADRANTS | null>(null);

  // Calculate positions for each idea
  const points: IdeaPoint[] = useMemo(() => {
    return ideas
      .filter((idea) => !idea.archived)
      .map((idea) => {
        const x = getEffortX(idea.rice_effort);
        const y = getImpactY(idea.rice_impact);
        return {
          idea,
          x,
          y,
          quadrant: getQuadrant(x, y),
          hasScore: idea.rice_score !== null,
        };
      });
  }, [ideas]);

  // Group by quadrant for stats
  const quadrantStats = useMemo(() => {
    const stats = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    points.forEach((p) => {
      stats[p.quadrant]++;
    });
    return stats;
  }, [points]);

  // Filter points based on selected quadrant
  const visiblePoints = selectedQuadrant
    ? points.filter((p) => p.quadrant === selectedQuadrant)
    : points;

  return (
    <div className="space-y-4">
      {/* Quadrant Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(QUADRANTS) as [keyof typeof QUADRANTS, typeof QUADRANTS[keyof typeof QUADRANTS]][]).map(
          ([key, quad]) => (
            <button
              key={key}
              onClick={() => setSelectedQuadrant(selectedQuadrant === key ? null : key)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors",
                selectedQuadrant === key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className={cn("font-medium", quad.color)}>{quad.label}</span>
              <span className="text-muted-foreground">({quadrantStats[key]})</span>
            </button>
          )
        )}
        {selectedQuadrant && (
          <button
            onClick={() => setSelectedQuadrant(null)}
            className="text-sm text-muted-foreground hover:text-text px-2"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Matrix Container */}
      <div className="relative aspect-square max-w-2xl mx-auto border border-border/30 rounded-lg bg-bg-secondary overflow-hidden">
        {/* Axis Labels */}
        <div className="absolute left-0 top-1/2 text-sm font-semibold text-foreground origin-left" style={{ transform: 'translateX(16px) rotate(-90deg)' }}>
          Impact (Low → High)
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground">
          Effort (Low → High)
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-8">
          {/* Quadrant backgrounds - subtle */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-500/40" /> {/* Quick Wins */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/40" /> {/* Major Projects */}
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-500/40" /> {/* Fill-ins */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-500/40" /> {/* Time Sinks */}

          {/* Center lines - slightly more visible */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

          {/* Quadrant Labels */}
          <div className="absolute top-3 left-3 text-sm font-bold text-white bg-black/60 px-2 py-1 rounded border border-white/20">
            Quick Wins
          </div>
          <div className="absolute top-3 right-3 text-sm font-bold text-white bg-black/60 px-2 py-1 rounded border border-white/20">
            Major Projects
          </div>
          <div className="absolute bottom-3 left-3 text-sm font-bold text-white bg-black/60 px-2 py-1 rounded border border-white/20">
            Fill-ins
          </div>
          <div className="absolute bottom-3 right-3 text-sm font-bold text-white bg-black/60 px-2 py-1 rounded border border-white/20">
            Time Sinks
          </div>

          {/* Data Points */}
          {visiblePoints.map((point) => (
            <div
              key={point.idea.id}
              className={cn(
                "absolute w-8 h-8 -translate-x-1/2 translate-y-1/2 flex items-center justify-center",
                "cursor-pointer transition-all duration-200"
              )}
              style={{
                left: `${point.x}%`,
                bottom: `${point.y}%`,
                zIndex: hoveredIdea === point.idea.id ? 50 : 10,
              }}
              onMouseEnter={() => setHoveredIdea(point.idea.id)}
              onMouseLeave={() => setHoveredIdea(null)}
              onClick={() => onIdeaClick?.(point.idea)}
            >
              <div
                className={cn(
                  "rounded-full transition-all duration-200",
                  point.hasScore ? "bg-primary" : "bg-muted-foreground/50 border-2 border-dashed border-muted-foreground",
                  hoveredIdea === point.idea.id
                    ? "w-6 h-6 ring-4 ring-primary/20"
                    : "w-4 h-4"
                )}
              />

              {/* Tooltip */}
              {hoveredIdea === point.idea.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                  <div className="bg-bg-elevated border border-white/[0.08] rounded-lg shadow-lg p-3 min-w-[200px] max-w-[280px]">
                    <div className="font-medium text-sm line-clamp-2 mb-2">
                      {point.idea.title}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={point.idea.status} size="sm" />
                      {point.idea.rice_score !== null && (
                        <span className="text-xs font-medium text-primary">
                          RICE: {point.idea.rice_score}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div>
                        Impact:{" "}
                        <span className="text-text">
                          {point.idea.rice_impact
                            ? RICE_IMPACT_LABELS[point.idea.rice_impact]
                            : "Not set"}
                        </span>
                      </div>
                      <div>
                        Effort:{" "}
                        <span className="text-text">
                          {point.idea.rice_effort || "Not set"}
                        </span>
                      </div>
                      <div>
                        Reach:{" "}
                        <span className="text-text">
                          {point.idea.rice_reach || "Not set"}
                        </span>
                      </div>
                      <div>
                        Confidence:{" "}
                        <span className="text-text">
                          {point.idea.rice_confidence !== null
                            ? `${point.idea.rice_confidence}%`
                            : "Not set"}
                        </span>
                      </div>
                    </div>
                    {!point.hasScore && (
                      <div className="mt-2 text-xs text-muted-foreground italic">
                        Complete RICE score to improve position
                      </div>
                    )}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-bg-elevated border-r border-b border-white/[0.08] rotate-45" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {visiblePoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">No ideas to display</p>
              <p className="text-sm">Add RICE scores to ideas to see them here</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {(Object.entries(QUADRANTS) as [keyof typeof QUADRANTS, typeof QUADRANTS[keyof typeof QUADRANTS]][]).map(
          ([key, quad]) => (
            <div
              key={key}
              className="p-3 rounded-lg bg-bg-secondary border border-white/[0.04]"
            >
              <div className={cn("text-2xl font-bold", quad.color)}>
                {quadrantStats[key]}
              </div>
              <div className="text-xs text-muted-foreground">{quad.label}</div>
            </div>
          )
        )}
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground bg-bg-tertiary rounded-lg p-3 space-y-1">
        <p className="font-medium">Prioritisation Tips:</p>
        <p>
          <span className="text-green-500">Quick Wins</span> - High impact, low effort. Do these first!
        </p>
        <p>
          <span className="text-blue-500">Major Projects</span> - High impact but require significant investment. Plan carefully.
        </p>
        <p>
          <span className="text-yellow-500">Fill-ins</span> - Low impact, low effort. Nice to have when you have spare time.
        </p>
        <p>
          <span className="text-red-500">Time Sinks</span> - Low impact, high effort. Avoid or delegate these.
        </p>
      </div>
    </div>
  );
}
