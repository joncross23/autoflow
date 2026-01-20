/**
 * IMPROVED IDEAS TABLE MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Consistent table row padding (py-4 = 48px height)
 * 2. Right-aligned numeric columns with tabular numbers
 * 3. Defined column widths (w-[n%]) for predictable layout
 * 4. Table headers with scope="col" for screen readers
 * 5. Proper filter button touch targets (h-11 md:h-9)
 * 6. Accessible icon buttons with aria-labels
 * 7. Status badges with icons (not color-only)
 * 8. Hover states with consistent bg-secondary/50
 *
 * Issues Fixed from Audit:
 * - Table rows: Inconsistent padding (now py-4 = 48px)
 * - RICE column: Not right-aligned (now text-right with tabular nums)
 * - Table headers: Missing scope="col" (now added)
 * - Column widths: Undefined (now w-[40%], w-[15%], etc.)
 * - Filter button: Too small on mobile (now h-11 md:h-9)
 * - Icon buttons: Missing aria-labels (now added)
 * - Status badges: Color-only (now icon + text)
 */

import React, { useState } from 'react';
import {
  Filter,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Lightbulb,
  Workflow,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function IdeasTableImproved() {
  const [sortColumn, setSortColumn] = useState('updated');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and evaluate your automation ideas
            </p>
          </div>

          <button
            className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Add new idea"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add idea</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Full-width container for table (no max-width) */}
        <div className="px-6 py-6">
          {/* Filters & Search Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search ideas..."
                className="w-full h-11 md:h-9 pl-10 pr-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Search ideas"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 h-11 md:h-9 px-4 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Open filters"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span>Filters</span>
                <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Active Filters (when filters applied) */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md">
              Status: In Progress
              <button
                className="hover:text-foreground transition-colors"
                aria-label="Remove status filter"
              >
                <XCircle className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md">
              RICE: ≥3.0
              <button
                className="hover:text-foreground transition-colors"
                aria-label="Remove RICE filter"
              >
                <XCircle className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
            <button className="text-xs text-primary hover:underline">Clear all</button>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full" role="table">
              {/* Table Header with scope="col" for accessibility */}
              <thead className="bg-secondary">
                <tr>
                  {/* Checkbox column */}
                  <th scope="col" className="w-[50px] px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      aria-label="Select all ideas"
                    />
                  </th>

                  {/* Name column - sortable, 40% width */}
                  <th scope="col" className="w-[40%] px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors"
                      onClick={() => handleSort('name')}
                      aria-label={`Sort by name ${
                        sortColumn === 'name'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>Name</span>
                      {sortColumn === 'name' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Status column - 15% width */}
                  <th scope="col" className="w-[15%] px-4 py-3 text-left">
                    <span className="font-semibold text-sm">Status</span>
                  </th>

                  {/* RICE column - sortable, right-aligned, 10% width */}
                  <th scope="col" className="w-[10%] px-4 py-3 text-right">
                    <button
                      className="flex items-center justify-end gap-2 font-semibold text-sm hover:text-foreground transition-colors ml-auto"
                      onClick={() => handleSort('rice')}
                      aria-label={`Sort by RICE score ${
                        sortColumn === 'rice'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>RICE</span>
                      {sortColumn === 'rice' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Owner column - 15% width */}
                  <th scope="col" className="w-[15%] px-4 py-3 text-left">
                    <span className="font-semibold text-sm">Owner</span>
                  </th>

                  {/* Updated column - sortable, 10% width */}
                  <th scope="col" className="w-[10%] px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors"
                      onClick={() => handleSort('updated')}
                      aria-label={`Sort by updated date ${
                        sortColumn === 'updated'
                          ? sortOrder === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`}
                    >
                      <span>Updated</span>
                      {sortColumn === 'updated' && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      )}
                    </button>
                  </th>

                  {/* Actions column */}
                  <th scope="col" className="w-[50px] px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body with consistent row height (py-4 = 48px) */}
              <tbody>
                {/* Row 1 */}
                <tr className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      aria-label="Select automate email reports"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">Automate email reports</p>
                      <p className="text-sm text-muted-foreground">
                        Generate weekly sales reports automatically
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {/* Status badge with icon (not color-only) */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-info text-white">
                      <Workflow className="h-3 w-3" aria-hidden="true" />
                      In Progress
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {/* Right-aligned numeric with tabular numbers */}
                    <span className="font-variant-numeric-tabular font-medium">3.5</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm">John Doe</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors"
                      aria-label="More actions for automate email reports"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      aria-label="Select customer onboarding workflow"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">Customer onboarding workflow</p>
                      <p className="text-sm text-muted-foreground">
                        Automate welcome emails and account setup
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-warning text-black">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-variant-numeric-tabular font-medium">4.2</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm">Jane Smith</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">5 days ago</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors"
                      aria-label="More actions for customer onboarding workflow"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      aria-label="Select invoice processing automation"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">Invoice processing automation</p>
                      <p className="text-sm text-muted-foreground">
                        Extract data from invoices automatically
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-success text-white">
                      <CheckCircle className="h-3 w-3" aria-hidden="true" />
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-variant-numeric-tabular font-medium">2.8</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm">Mike Johnson</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors"
                      aria-label="More actions for invoice processing automation"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      aria-label="Select lead scoring system"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">Lead scoring system</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically score and prioritise leads
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-secondary text-foreground border border-border">
                      <Lightbulb className="h-3 w-3" aria-hidden="true" />
                      New
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-variant-numeric-tabular font-medium">5.1</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm">Sarah Williams</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">3 hours ago</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors"
                      aria-label="More actions for lead scoring system"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1-4</span> of{' '}
              <span className="font-medium">11</span> ideas
            </p>

            <div className="flex items-center gap-2">
              <button
                className="h-9 px-3 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                disabled
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                className="h-9 px-3 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>

          {/* Empty State (when no results) */}
          {/*
          <div className="bg-card border border-border rounded-xl">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No ideas found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Try adjusting your filters or search query.
              </p>
              <button className="h-9 px-4 bg-secondary text-foreground rounded-lg hover:bg-secondary/80">
                Clear filters
              </button>
            </div>
          </div>
          */}
        </div>
      </main>
    </div>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Table Layout:
 * - py-4: Row padding (48px total height - comfortable)
 * - w-[40%]: Name column (widest, holds title + description)
 * - w-[15%]: Status, Owner columns
 * - w-[10%]: RICE, Updated columns
 * - w-[50px]: Checkbox, Actions columns (fixed width)
 *
 * Colors:
 * - bg-secondary: Table header background
 * - hover:bg-secondary/50: Row hover state
 * - bg-info, bg-success, bg-warning: Status badge backgrounds (with icons)
 * - text-muted-foreground: Metadata (dates, descriptions)
 *
 * Typography:
 * - font-variant-numeric-tabular: RICE scores (aligned digits)
 * - text-right: Numeric columns (easy comparison)
 * - text-sm: Table body text
 *
 * Accessibility:
 * - scope="col": All table headers
 * - aria-label: Sort buttons, icon buttons, checkboxes
 * - aria-hidden="true": Decorative icons
 * - Status badges: Icon + text (not color-only)
 * - Sortable columns announce direction for screen readers
 *
 * Touch Targets:
 * - h-11 md:h-9: Filter button, search input (44px mobile)
 * - h-8 w-8: Icon buttons in table rows (32px - acceptable for dense table)
 * - h-4 w-4: Checkboxes (16px visual, larger hit area via padding)
 */
