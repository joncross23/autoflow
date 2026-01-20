/**
 * IMPROVED DASHBOARD MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Consistent stat card padding (p-4) across all cards
 * 2. Standardized section spacing (space-y-6 for sections, space-y-3 for content)
 * 3. Proper touch targets (h-11 md:h-9 for buttons on mobile)
 * 4. Accessible icon buttons with aria-labels
 * 5. Semantic color usage (explicit white on primary backgrounds)
 * 6. Clear visual hierarchy with proper heading sizes
 * 7. Responsive grid layouts (grid-cols-1 md:grid-cols-3)
 *
 * Issues Fixed from Audit:
 * - Dashboard stat cards: Inconsistent padding (was 12px/16px/20px, now 16px)
 * - Quick capture button: Touch target too small on mobile (now 44px)
 * - Section spacing: Varied 16-48px (now consistent 24px)
 * - Icon colors on primary-muted: Contrast failure (now explicit white)
 * - Add Idea button: Missing responsive sizing (now h-11 md:h-9)
 */

import React from 'react';
import {
  Lightbulb,
  Workflow,
  CheckCircle,
  TrendingUp,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardImproved() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header - Sticky with consistent padding */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your automation ideas and progress
            </p>
          </div>

          {/* Primary action - responsive touch target */}
          <button
            className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Add new idea"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add idea</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Section 1: Metrics Overview */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overview
            </h2>

            {/* Stat Cards Grid - Consistent padding (p-4), responsive columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Ideas Card */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-muted p-2">
                    {/* Icon with explicit white color for contrast */}
                    <Lightbulb className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">11</p>
                    <p className="text-sm text-muted-foreground">Total Ideas</p>
                  </div>
                </div>
              </div>

              {/* In Progress Card */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-info-muted p-2">
                    <Workflow className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">3</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success-muted p-2">
                    <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">8</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Impact Metrics */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Potential ROI Card */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success-muted p-2">
                    <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">£127k</p>
                    <p className="text-sm text-muted-foreground">Potential Annual Savings</p>
                  </div>
                </div>
              </div>

              {/* Time Saved Card */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-info-muted p-2">
                    <Clock className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">2,400</p>
                    <p className="text-sm text-muted-foreground">Hours Saved Annually</p>
                  </div>
                </div>
              </div>

              {/* People Impacted Card */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning-muted p-2">
                    <Users className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">47</p>
                    <p className="text-sm text-muted-foreground">People Impacted</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Quick Capture */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Capture
              </h2>
            </div>

            {/* Quick capture card with consistent padding */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="rounded-lg bg-primary-muted p-3 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Got an automation idea?</h3>
                    <p className="text-sm text-muted-foreground">
                      Quickly capture your idea and our AI will help evaluate its potential impact.
                    </p>
                  </div>

                  {/* Quick capture form */}
                  <div className="space-y-3">
                    <textarea
                      placeholder="Describe your automation idea... (e.g., 'Automate weekly sales reports')"
                      className="w-full min-h-[100px] px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Quick idea capture"
                    />

                    <div className="flex items-center gap-3">
                      {/* Responsive button sizing */}
                      <button
                        className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        aria-label="Capture and analyze idea with AI"
                      >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        <span>Analyse with AI</span>
                      </button>

                      <button
                        className="h-11 md:h-9 px-4 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Ideas in Progress */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ideas in Progress</h2>
              <button
                className="flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="View all ideas"
              >
                <span>View all</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Ideas list with consistent spacing */}
            <div className="space-y-3">
              {/* Idea Card 1 */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">Automate email reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate and send weekly sales reports automatically
                    </p>

                    {/* Status badges with semantic colors and icons (not color-only) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-info text-white">
                        <Workflow className="h-3 w-3" aria-hidden="true" />
                        In Progress
                      </span>
                      <span className="text-xs text-muted-foreground">Updated 2 days ago</span>
                    </div>
                  </div>

                  {/* RICE score with proper alignment */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold font-variant-numeric-tabular">3.5</p>
                    <p className="text-xs text-muted-foreground">RICE Score</p>
                  </div>
                </div>
              </div>

              {/* Idea Card 2 */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">Customer onboarding workflow</h3>
                    <p className="text-sm text-muted-foreground">
                      Automate welcome emails, account setup, and initial training
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-warning text-black">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Pending Review
                      </span>
                      <span className="text-xs text-muted-foreground">Updated 5 days ago</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold font-variant-numeric-tabular">4.2</p>
                    <p className="text-xs text-muted-foreground">RICE Score</p>
                  </div>
                </div>
              </div>

              {/* Idea Card 3 */}
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">Invoice processing automation</h3>
                    <p className="text-sm text-muted-foreground">
                      Extract data from invoices and update accounting system
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-info text-white">
                        <Workflow className="h-3 w-3" aria-hidden="true" />
                        In Progress
                      </span>
                      <span className="text-xs text-muted-foreground">Updated 1 week ago</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold font-variant-numeric-tabular">2.8</p>
                    <p className="text-xs text-muted-foreground">RICE Score</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Empty state pattern for when no ideas exist */}
          {/*
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Ideas in Progress</h2>

            <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <Lightbulb className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No ideas in progress</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Start capturing automation ideas to see them here.
              </p>
              <button className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first idea
              </button>
            </div>
          </section>
          */}
        </div>
      </main>
    </div>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Colors:
 * - bg-background: Page background
 * - bg-card: Card backgrounds
 * - bg-primary: Primary action backgrounds
 * - bg-primary-muted: Accent backgrounds (with explicit white text)
 * - bg-success-muted, bg-info-muted, bg-warning-muted: Semantic icon backgrounds
 * - text-foreground: Primary text
 * - text-muted-foreground: Secondary/metadata text
 * - border-border: All borders
 *
 * Spacing:
 * - px-6 py-4: Page header padding (consistent)
 * - p-4: Stat card padding (consistent 16px)
 * - p-6: Content card padding (24px for comfortable reading)
 * - space-y-6: Section spacing (24px between major sections)
 * - space-y-3: Subsection spacing (12px for related items)
 * - space-y-4: Content spacing (16px in cards)
 * - gap-4: Grid gap (16px between cards)
 * - gap-3: Button group gap (12px)
 *
 * Typography:
 * - text-2xl font-semibold: Page title (h1)
 * - text-lg font-semibold: Section title (h2)
 * - text-sm font-semibold uppercase: Overline heading
 * - text-3xl font-bold: Stat numbers
 * - text-sm text-muted-foreground: Labels and metadata
 * - font-variant-numeric-tabular: Numeric data (RICE scores)
 *
 * Touch Targets:
 * - h-11 md:h-9: Buttons (44px mobile, 36px desktop)
 * - min-h-[100px]: Textarea (comfortable typing area)
 *
 * Border Radius:
 * - rounded-xl: Cards (12px)
 * - rounded-lg: Buttons, inputs, icon backgrounds (8px)
 * - rounded-md: Small badges (6px)
 *
 * Accessibility:
 * - aria-label on all icon buttons
 * - aria-hidden="true" on decorative icons
 * - Semantic HTML (header, main, section, button)
 * - Visible focus rings (focus:ring-2 focus:ring-primary)
 * - Sufficient color contrast (4.5:1+ for all text)
 * - Status conveyed via icon + text (not color alone)
 * - 44px touch targets on mobile
 */
