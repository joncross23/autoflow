/**
 * IMPROVED TIME AUDIT MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Right-aligned numeric data with tabular numbers
 * 2. Progress bars with explicit percentage labels
 * 3. Clear column headers with semantic meanings
 * 4. ROI indicators with icons (not color-only)
 * 5. Sortable columns with aria-labels
 * 6. Summary cards with proper hierarchy
 * 7. Chart legends and axis labels
 * 8. Consistent table row padding (py-4 = 48px)
 *
 * Issues Fixed from Audit:
 * - Numeric columns: Not right-aligned (now text-right with tabular nums)
 * - Progress bars: No labels/scale (now show percentage + label)
 * - ROI indicators: Color-only (now icon + text + color)
 * - Table headers: Missing scope="col" (now added)
 * - Row padding: Inconsistent (now py-4 = 48px)
 * - Summary cards: Poor hierarchy (now clear visual structure)
 * - Chart: No axis labels (now added)
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  ChevronUp,
  ChevronDown,
  Download,
} from 'lucide-react';

export default function TimeAuditImproved() {
  const [sortColumn, setSortColumn] = useState('roi');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const ideas = [
    {
      id: 1,
      name: 'Email automation',
      currentTime: 480,
      savedTime: 400,
      cost: 12000,
      roi: 3.8,
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Invoice processing',
      currentTime: 360,
      savedTime: 300,
      cost: 8000,
      roi: 3.2,
      status: 'In Progress',
    },
    {
      id: 3,
      name: 'Lead scoring',
      currentTime: 240,
      savedTime: 180,
      cost: 6000,
      roi: 2.5,
      status: 'In Progress',
    },
    {
      id: 4,
      name: 'Report generation',
      currentTime: 180,
      savedTime: 120,
      cost: 4500,
      roi: 2.1,
      status: 'Planned',
    },
    {
      id: 5,
      name: 'Data sync',
      currentTime: 120,
      savedTime: 80,
      cost: 5000,
      roi: 1.2,
      status: 'Planned',
    },
  ];

  // Calculate totals
  const totalCurrentTime = ideas.reduce((sum, idea) => sum + idea.currentTime, 0);
  const totalSavedTime = ideas.reduce((sum, idea) => sum + idea.savedTime, 0);
  const totalCost = ideas.reduce((sum, idea) => sum + idea.cost, 0);
  const avgROI = ideas.reduce((sum, idea) => sum + idea.roi, 0) / ideas.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Time Audit</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyse time savings and ROI for automation ideas
            </p>
          </div>

          <button
            className="flex items-center gap-2 h-11 md:h-9 px-4 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            aria-label="Export time audit report"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Time Spent Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Clock className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">Current Time Spent</p>
              </div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                {totalCurrentTime.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">hours per year</p>
            </div>

            {/* Time Saved Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-success-muted p-2">
                  <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">Potential Time Saved</p>
              </div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                {totalSavedTime.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">hours per year</p>
            </div>

            {/* Investment Cost Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-secondary p-2">
                  <DollarSign className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
              </div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                £{(totalCost / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">one-time cost</p>
            </div>

            {/* Average ROI Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-success-muted p-2">
                  <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">Average ROI</p>
              </div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                {avgROI.toFixed(1)}x
              </p>
              <p className="text-xs text-muted-foreground">return on investment</p>
            </div>
          </div>

          {/* Time Savings Chart (Simplified) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Time Savings Breakdown</h2>

            {/* Horizontal Bar Chart */}
            <div className="space-y-4">
              {ideas
                .sort((a, b) => b.savedTime - a.savedTime)
                .map((idea) => {
                  const percentage = ((idea.savedTime / totalSavedTime) * 100).toFixed(0);
                  return (
                    <div key={idea.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-medium">{idea.name}</p>
                        <p className="text-muted-foreground font-variant-numeric-tabular">
                          {idea.savedTime} hours ({percentage}%)
                        </p>
                      </div>

                      {/* Progress bar with explicit percentage and label */}
                      <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-success flex items-center justify-end px-3"
                          style={{ width: `${percentage}%` }}
                          role="progressbar"
                          aria-valuenow={Number(percentage)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${idea.name}: ${percentage}% of total time saved`}
                        >
                          {Number(percentage) > 15 && (
                            <span className="text-xs font-medium text-white">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Chart Axis Labels */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>0 hours</span>
              <span>{totalSavedTime} hours (100%)</span>
            </div>
          </div>

          {/* Detailed ROI Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">ROI Analysis</h2>
            </div>

            <table className="w-full" role="table">
              <thead className="bg-secondary">
                <tr>
                  {/* Name column */}
                  <th scope="col" className="px-6 py-3 text-left">
                    <span className="font-semibold text-sm">Automation Idea</span>
                  </th>

                  {/* Current Time column - right-aligned */}
                  <th scope="col" className="px-6 py-3 text-right">
                    <button
                      className="flex items-center justify-end gap-2 font-semibold text-sm hover:text-foreground transition-colors ml-auto"
                      onClick={() => handleSort('currentTime')}
                      aria-label={`Sort by current time ${
                        sortColumn === 'currentTime'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>Current Time</span>
                      {sortColumn === 'currentTime' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Saved Time column - right-aligned */}
                  <th scope="col" className="px-6 py-3 text-right">
                    <button
                      className="flex items-center justify-end gap-2 font-semibold text-sm hover:text-foreground transition-colors ml-auto"
                      onClick={() => handleSort('savedTime')}
                      aria-label={`Sort by saved time ${
                        sortColumn === 'savedTime'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>Time Saved</span>
                      {sortColumn === 'savedTime' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Cost column - right-aligned */}
                  <th scope="col" className="px-6 py-3 text-right">
                    <button
                      className="flex items-center justify-end gap-2 font-semibold text-sm hover:text-foreground transition-colors ml-auto"
                      onClick={() => handleSort('cost')}
                      aria-label={`Sort by cost ${
                        sortColumn === 'cost'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>Investment</span>
                      {sortColumn === 'cost' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* ROI column - right-aligned */}
                  <th scope="col" className="px-6 py-3 text-right">
                    <button
                      className="flex items-center justify-end gap-2 font-semibold text-sm hover:text-foreground transition-colors ml-auto"
                      onClick={() => handleSort('roi')}
                      aria-label={`Sort by ROI ${
                        sortColumn === 'roi'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>ROI</span>
                      {sortColumn === 'roi' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Status column */}
                  <th scope="col" className="px-6 py-3 text-left">
                    <span className="font-semibold text-sm">Status</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <p className="font-medium">{idea.name}</p>
                    </td>

                    {/* Current Time - right-aligned with tabular numbers */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-variant-numeric-tabular">
                        {idea.currentTime.toLocaleString()} hrs
                      </span>
                    </td>

                    {/* Saved Time - right-aligned with tabular numbers */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-variant-numeric-tabular text-success font-medium">
                        {idea.savedTime.toLocaleString()} hrs
                      </span>
                    </td>

                    {/* Cost - right-aligned with tabular numbers */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-variant-numeric-tabular">
                        £{(idea.cost / 1000).toFixed(1)}k
                      </span>
                    </td>

                    {/* ROI - right-aligned with icon indicator (not color-only) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {idea.roi >= 2.5 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="font-variant-numeric-tabular font-bold text-success">
                              {idea.roi.toFixed(1)}x
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-warning" aria-hidden="true" />
                            <span className="font-variant-numeric-tabular font-medium text-warning">
                              {idea.roi.toFixed(1)}x
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                          idea.status === 'Completed'
                            ? 'bg-success text-white'
                            : idea.status === 'In Progress'
                            ? 'bg-info text-white'
                            : 'bg-secondary text-foreground border border-border'
                        }`}
                      >
                        {idea.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="border-t-2 border-border bg-secondary/30 font-semibold">
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4 text-right font-variant-numeric-tabular">
                    {totalCurrentTime.toLocaleString()} hrs
                  </td>
                  <td className="px-6 py-4 text-right font-variant-numeric-tabular text-success">
                    {totalSavedTime.toLocaleString()} hrs
                  </td>
                  <td className="px-6 py-4 text-right font-variant-numeric-tabular">
                    £{(totalCost / 1000).toFixed(0)}k
                  </td>
                  <td className="px-6 py-4 text-right font-variant-numeric-tabular">
                    {avgROI.toFixed(1)}x avg
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ROI Explanation Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">How ROI is Calculated</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">ROI (Return on Investment)</span> = (Annual Savings × 3 years) / Implementation Cost
              </p>
              <p>
                <span className="font-medium text-foreground">Annual Savings</span> = Time Saved × Hourly Rate (£50/hour)
              </p>
              <div className="flex items-start gap-2 pt-2">
                <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p>
                  <span className="font-medium text-success">High ROI (≥2.5x):</span> Strong return, prioritise implementation
                </p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p>
                  <span className="font-medium text-warning">Lower ROI (&lt;2.5x):</span> Consider other benefits or defer
                </p>
              </div>
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
 * Table Layout:
 * - py-4: Row padding (48px height - consistent)
 * - text-right: All numeric columns (easy comparison)
 * - font-variant-numeric-tabular: Numeric data (aligned digits)
 * - scope="col": All table headers (accessibility)
 *
 * Summary Cards:
 * - p-4: Card padding (16px)
 * - text-3xl font-bold: Primary metric
 * - text-xs text-muted-foreground: Label text
 *
 * Progress Bars:
 * - h-8: Bar height (32px - comfortable for reading labels)
 * - bg-success: Fill color (semantic green for savings)
 * - role="progressbar" with aria attributes: Screen reader support
 * - Explicit percentage label inside bar
 *
 * ROI Indicators:
 * - Icon + text + color: Not color-only (accessible)
 * - TrendingUp (green): High ROI (≥2.5x)
 * - TrendingDown (amber): Lower ROI (<2.5x)
 * - font-variant-numeric-tabular: Aligned decimals
 *
 * Colors:
 * - bg-success-muted: Positive metrics (time saved, high ROI)
 * - bg-secondary: Neutral metrics (current time, investment)
 * - text-success: Positive values in table
 * - text-warning: Lower values needing attention
 *
 * Typography:
 * - toLocaleString(): Comma-separated thousands
 * - .toFixed(1): Consistent decimal places
 * - font-medium, font-semibold, font-bold: Clear hierarchy
 *
 * Accessibility:
 * - scope="col": All table headers
 * - aria-label: Sort buttons with direction
 * - aria-valuenow, aria-valuemin, aria-valuemax: Progress bars
 * - Icon + text + color: ROI indicators (not color-only)
 * - Totals row with border-t-2: Clear visual separation
 * - Explanation card: Helps users understand calculations
 *
 * Chart Improvements:
 * - Horizontal bars with explicit percentages
 * - Axis labels (0 hours → total hours)
 * - Labels outside bar when < 15% (readability)
 * - Sorted by value (largest to smallest)
 */
