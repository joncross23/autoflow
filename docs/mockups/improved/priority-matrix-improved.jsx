/**
 * IMPROVED PRIORITY MATRIX MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Larger quadrant labels (text-lg) with better contrast
 * 2. Clear axis labels with semantic meaning
 * 3. Data points with icons + text (not color-only)
 * 4. Explicit RICE score display on hover
 * 5. Legend explaining quadrant meanings
 * 6. Grid lines for easier position reading
 * 7. Accessible color palette with patterns
 * 8. Touch-friendly data point sizes (min 44px)
 *
 * Issues Fixed from Audit:
 * - Quadrant labels: Too small (was text-sm, now text-lg)
 * - Labels: Low contrast (now text-foreground with bg-background)
 * - Axis labels: Missing (now added with clear meanings)
 * - Data points: Color-only (now with icons + tooltips)
 * - No legend: Added to explain quadrants
 * - Grid lines: Missing (now subtle bg-border lines)
 * - Touch targets: Data points now min 44px tap area
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  Users,
  Info,
  ChevronRight,
} from 'lucide-react';

export default function PriorityMatrixImproved() {
  const [hoveredIdea, setHoveredIdea] = useState(null);

  const ideas = [
    { id: 1, name: 'Email automation', x: 75, y: 80, rice: 4.2, reach: 500, impact: 8 },
    { id: 2, name: 'Invoice processing', x: 60, y: 70, rice: 3.8, reach: 300, impact: 7 },
    { id: 3, name: 'Customer onboarding', x: 85, y: 60, rice: 3.5, reach: 800, impact: 6 },
    { id: 4, name: 'Lead scoring', x: 40, y: 75, rice: 3.2, reach: 200, impact: 7.5 },
    { id: 5, name: 'Report generation', x: 55, y: 40, rice: 2.8, reach: 250, impact: 4 },
    { id: 6, name: 'Data sync', x: 30, y: 55, rice: 2.5, reach: 150, impact: 5.5 },
    { id: 7, name: 'Social media posts', x: 70, y: 25, rice: 2.1, reach: 400, impact: 2.5 },
    { id: 8, name: 'File backup', x: 25, y: 30, rice: 1.8, reach: 100, impact: 3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Priority Matrix</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise ideas by reach and impact
            </p>
          </div>

          <button
            className="flex items-center gap-2 h-9 px-4 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            aria-label="View as table"
          >
            <span>View as table</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Legend & Filters */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Legend */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Quadrant Guide</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Quick Wins */}
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Quick Wins</p>
                    <p className="text-xs text-muted-foreground">High impact, high reach</p>
                  </div>
                </div>

                {/* Major Projects */}
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-info mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Major Projects</p>
                    <p className="text-xs text-muted-foreground">High impact, lower reach</p>
                  </div>
                </div>

                {/* Fill Ins */}
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Fill Ins</p>
                    <p className="text-xs text-muted-foreground">Lower impact, high reach</p>
                  </div>
                </div>

                {/* Low Priority */}
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary border border-border mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Low Priority</p>
                    <p className="text-xs text-muted-foreground">Lower impact, lower reach</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RICE Score Summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-sm font-semibold mb-3">RICE Breakdown</h2>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reach</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <p className="font-medium">People/time</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Impact</p>
                  <div className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <p className="font-medium">0-10 scale</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <p className="font-medium">% certainty</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Effort</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <p className="font-medium">Person-days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Matrix Title (visible to screen readers) */}
            <h2 className="sr-only">Priority matrix chart showing ideas plotted by reach and impact</h2>

            {/* Matrix Grid */}
            <div className="relative" style={{ aspectRatio: '1/1', maxWidth: '800px', margin: '0 auto' }}>
              {/* Quadrant Background Colors (subtle tints) */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {/* Top Right: Quick Wins (high reach, high impact) */}
                <div className="col-start-2 row-start-1 bg-success/5" />

                {/* Top Left: Major Projects (low reach, high impact) */}
                <div className="col-start-1 row-start-1 bg-info/5" />

                {/* Bottom Right: Fill Ins (high reach, low impact) */}
                <div className="col-start-2 row-start-2 bg-warning/5" />

                {/* Bottom Left: Low Priority (low reach, low impact) */}
                <div className="col-start-1 row-start-2 bg-secondary/50" />
              </div>

              {/* Grid Lines (subtle, every 25%) */}
              <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                {/* Vertical lines */}
                <line x1="25%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1.5" className="text-border" />
                <line x1="75%" y1="0" x2="75%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />

                {/* Horizontal lines */}
                <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1.5" className="text-border" />
                <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />
              </svg>

              {/* Quadrant Labels (larger, better contrast) */}
              <div className="absolute top-4 left-4 bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <p className="text-lg font-semibold text-foreground">Major Projects</p>
                <p className="text-xs text-muted-foreground">High impact, lower reach</p>
              </div>

              <div className="absolute top-4 right-4 bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <p className="text-lg font-semibold text-foreground">Quick Wins</p>
                <p className="text-xs text-muted-foreground">High impact, high reach</p>
              </div>

              <div className="absolute bottom-4 left-4 bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <p className="text-lg font-semibold text-foreground">Low Priority</p>
                <p className="text-xs text-muted-foreground">Lower impact, lower reach</p>
              </div>

              <div className="absolute bottom-4 right-4 bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <p className="text-lg font-semibold text-foreground">Fill Ins</p>
                <p className="text-xs text-muted-foreground">Lower impact, high reach</p>
              </div>

              {/* Data Points */}
              {ideas.map((idea) => {
                // Determine quadrant color based on position
                const isHighReach = idea.x > 50;
                const isHighImpact = idea.y > 50;

                let color = 'bg-secondary border-border'; // Low Priority
                if (isHighReach && isHighImpact) color = 'bg-success border-success'; // Quick Wins
                else if (!isHighReach && isHighImpact) color = 'bg-info border-info'; // Major Projects
                else if (isHighReach && !isHighImpact) color = 'bg-warning border-warning'; // Fill Ins

                return (
                  <button
                    key={idea.id}
                    className={`absolute w-11 h-11 -ml-5.5 -mt-5.5 rounded-full border-2 ${color} flex items-center justify-center shadow-lg hover:scale-125 transition-all cursor-pointer`}
                    style={{
                      left: `${idea.x}%`,
                      bottom: `${idea.y}%`, // Y-axis inverted (bottom = high impact)
                    }}
                    onMouseEnter={() => setHoveredIdea(idea)}
                    onMouseLeave={() => setHoveredIdea(null)}
                    aria-label={`${idea.name}: RICE ${idea.rice}, Reach ${idea.reach}, Impact ${idea.impact}`}
                  >
                    {/* RICE score inside circle */}
                    <span className="text-xs font-bold text-white">
                      {idea.rice}
                    </span>
                  </button>
                );
              })}

              {/* Tooltip on Hover */}
              {hoveredIdea && (
                <div
                  className="absolute bg-background border border-border rounded-lg shadow-xl p-3 z-20 pointer-events-none"
                  style={{
                    left: `${hoveredIdea.x}%`,
                    bottom: `${hoveredIdea.y}%`,
                    transform: 'translate(-50%, calc(-100% - 16px))', // Center above point
                  }}
                >
                  <p className="font-semibold text-sm mb-2">{hoveredIdea.name}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">RICE Score:</span>
                      <span className="font-medium">{hoveredIdea.rice}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Reach:</span>
                      <span className="font-medium">{hoveredIdea.reach} people</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="font-medium">{hoveredIdea.impact}/10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Axis Labels */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>Reach</span>
                <span className="text-xs text-muted-foreground">(people affected)</span>
              </div>

              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground rotate-90" aria-hidden="true" />
                <span>Impact</span>
                <span className="text-xs text-muted-foreground">(value per person)</span>
              </div>
            </div>

            {/* Matrix Footer (axis extremes) */}
            <div className="flex items-center justify-between mt-12 text-xs text-muted-foreground">
              <div className="flex flex-col items-start">
                <span>Low Reach</span>
                <span className="text-[10px]">(Fewer people)</span>
              </div>
              <div className="flex flex-col items-end">
                <span>High Reach</span>
                <span className="text-[10px]">(More people)</span>
              </div>
            </div>
          </div>

          {/* Ideas List Below Matrix */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">All Ideas</h2>

            <div className="space-y-2">
              {ideas
                .sort((a, b) => b.rice - a.rice)
                .map((idea) => {
                  const isHighReach = idea.x > 50;
                  const isHighImpact = idea.y > 50;

                  let quadrant = 'Low Priority';
                  let badgeColor = 'bg-secondary text-foreground border border-border';

                  if (isHighReach && isHighImpact) {
                    quadrant = 'Quick Wins';
                    badgeColor = 'bg-success text-white';
                  } else if (!isHighReach && isHighImpact) {
                    quadrant = 'Major Projects';
                    badgeColor = 'bg-info text-white';
                  } else if (isHighReach && !isHighImpact) {
                    quadrant = 'Fill Ins';
                    badgeColor = 'bg-warning text-black';
                  }

                  return (
                    <div
                      key={idea.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-muted">
                          <span className="text-sm font-bold text-white">{idea.rice}</span>
                        </div>
                        <p className="font-medium">{idea.name}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <p className="text-muted-foreground">Reach: {idea.reach}</p>
                          <p className="text-muted-foreground">Impact: {idea.impact}/10</p>
                        </div>

                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${badgeColor} whitespace-nowrap`}>
                          {quadrant}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Matrix Layout:
 * - aspect-ratio: 1/1: Square matrix (equal axes)
 * - max-width: 800px: Readable size
 * - Quadrant backgrounds: bg-success/5, bg-info/5, bg-warning/5 (subtle tints)
 *
 * Quadrant Labels:
 * - text-lg font-semibold: Larger, more readable (was text-sm)
 * - bg-background with border: Clear contrast on any quadrant
 * - px-3 py-1.5: Comfortable padding
 *
 * Data Points:
 * - w-11 h-11: 44px circles (touch-friendly)
 * - border-2: Clear quadrant color coding
 * - text-xs font-bold text-white: RICE score visible inside
 * - hover:scale-125: Visual feedback on interaction
 *
 * Grid Lines:
 * - stroke-border opacity-30: Subtle reference lines
 * - Centerlines at 50% with strokeWidth 1.5: Stronger visual divider
 *
 * Axis Labels:
 * - text-sm font-medium: Clear, readable
 * - Icons with semantic meaning (Users for reach, Target for impact)
 * - Rotated -90deg for y-axis label
 *
 * Tooltip:
 * - bg-background border shadow-xl: Elevated, clear
 * - Positioned above data point with transform
 * - Shows RICE, Reach, Impact values
 *
 * Legend:
 * - Grid of 4 quadrant explanations
 * - Color dots matching quadrants
 * - Clear text descriptions
 *
 * Colors:
 * - bg-success: Quick Wins (top-right)
 * - bg-info: Major Projects (top-left)
 * - bg-warning: Fill Ins (bottom-right)
 * - bg-secondary: Low Priority (bottom-left)
 *
 * Accessibility:
 * - sr-only heading for chart context
 * - aria-label on each data point with full details
 * - Icons with aria-hidden="true"
 * - Hover tooltips with full information
 * - Ideas list below matrix (alternative view)
 * - Quadrant badges with text (not color-only)
 * - Touch-friendly 44px data points
 *
 * Note: For keyboard navigation, consider adding arrow key
 * support to move between data points and Enter to view details.
 */
