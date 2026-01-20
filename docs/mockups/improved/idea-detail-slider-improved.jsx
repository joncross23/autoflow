/**
 * IMPROVED IDEA DETAIL SLIDER MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Standardised width (w-[600px] matching modal pattern)
 * 2. Clear section spacing (space-y-6 = 24px)
 * 3. Fixed header and scrollable content
 * 4. AI evaluation prominently placed
 * 5. Accessible tabs for switching views
 * 6. Proper status badges with icons
 * 7. RICE breakdown with clear labels
 * 8. Action buttons with proper hierarchy
 *
 * Issues Fixed from Audit:
 * - Width: Inconsistent with modals (now w-[600px] standard)
 * - Header: Not sticky (now fixed)
 * - Section spacing: Varied (now space-y-6 = 24px)
 * - AI evaluation: Buried (now prominent section)
 * - Content padding: Inconsistent (now p-6 throughout)
 * - Scrollable area: No clear boundary (now flex-1 overflow-y-auto)
 * - Status badges: Color-only (now icon + text)
 */

import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Archive,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
} from 'lucide-react';

export default function IdeaDetailSliderImproved({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slider */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[600px] bg-background border-l border-border z-50 flex flex-col shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="idea-title"
      >
        {/* Header - Fixed */}
        <div className="border-b border-border p-6 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 id="idea-title" className="text-xl font-semibold mb-2">
                Automate email reports
              </h1>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-info text-white">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                In Progress
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close idea details"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border -mb-6 pb-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'overview' ? 'page' : undefined}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'evaluation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'evaluation' ? 'page' : undefined}
            >
              AI Evaluation
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-current={activeTab === 'activity' ? 'page' : undefined}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Description Section */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-sm leading-relaxed">
                  Generate and send weekly sales reports automatically to stakeholders. Currently takes 8 hours per week of manual work compiling data from multiple sources, formatting, and distributing via email.
                </p>
              </section>

              {/* RICE Score Section */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  RICE Score
                </h2>

                {/* Overall Score */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary-muted p-2">
                        <Target className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      <p className="text-3xl font-bold font-variant-numeric-tabular">3.5</p>
                    </div>
                  </div>

                  {/* RICE Breakdown */}
                  <div className="space-y-3 text-sm">
                    {/* Reach */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">Reach</span>
                      </div>
                      <span className="font-variant-numeric-tabular">500 people/quarter</span>
                    </div>

                    {/* Impact */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">Impact</span>
                      </div>
                      <span className="font-variant-numeric-tabular">8/10 (high)</span>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">Confidence</span>
                      </div>
                      <span className="font-variant-numeric-tabular">80%</span>
                    </div>

                    {/* Effort */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">Effort</span>
                      </div>
                      <span className="font-variant-numeric-tabular">40 person-days</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Meta Information Section */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Details
                </h2>

                <div className="space-y-3 text-sm">
                  {/* Owner */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>Owner</span>
                    </div>
                    <span className="font-medium">John Doe</span>
                  </div>

                  {/* Created */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Created</span>
                    </div>
                    <span className="font-medium">Dec 15, 2025</span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>Last updated</span>
                    </div>
                    <span className="font-medium">2 days ago</span>
                  </div>

                  {/* Attachments */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Paperclip className="h-4 w-4" aria-hidden="true" />
                      <span>Attachments</span>
                    </div>
                    <button className="text-primary hover:underline font-medium">
                      3 files
                    </button>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      <span>Comments</span>
                    </div>
                    <button className="text-primary hover:underline font-medium">
                      8 comments
                    </button>
                  </div>
                </div>
              </section>

              {/* Tasks Section (if idea has been accepted) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Implementation Tasks
                  </h2>
                  <span className="text-xs text-muted-foreground">3 of 5 completed</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm line-through text-muted-foreground">
                      Set up authentication system
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm line-through text-muted-foreground">
                      Build email automation flow
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm line-through text-muted-foreground">
                      Design dashboard mockups
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="h-4 w-4 rounded-full border-2 border-border flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">
                      User testing feedback
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="h-4 w-4 rounded-full border-2 border-border flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">
                      Database migration
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'evaluation' && (
            <>
              {/* AI Evaluation Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary-muted p-2">
                    <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold">AI Evaluation</h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Generated by Claude on Dec 15, 2025
                </p>

                {/* Impact Assessment */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Impact Assessment</h3>
                  <p className="text-sm leading-relaxed">
                    This automation has <span className="font-semibold text-success">high potential impact</span>. Automating weekly report generation will save approximately 8 hours of manual work per week (416 hours annually), freeing up the sales operations team for more strategic work.
                  </p>
                </div>

                {/* Implementation Complexity */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Implementation Complexity</h3>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-warning">Moderate complexity</span>. Requires integration with Salesforce, data transformation pipeline, and email distribution system. Estimated 6-8 weeks for a team of 2.
                  </p>
                </div>

                {/* Risks & Considerations */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Risks & Considerations</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      <span>Data accuracy must be verified before distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      <span>Stakeholders may need training on new format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      <span>Requires maintenance when Salesforce schema changes</span>
                    </li>
                  </ul>
                </div>

                {/* Recommendation */}
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-success mb-2">Recommendation: Proceed</h3>
                      <p className="text-sm">
                        This automation offers strong ROI and aligns with strategic goals of reducing manual operational work. Prioritise for Q1 implementation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'activity' && (
            <>
              {/* Activity Feed */}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent Activity
                </h2>

                <div className="space-y-4">
                  {/* Activity Item 1 */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary-muted p-1.5 flex-shrink-0">
                      <Edit className="h-3 w-3 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">John Doe</span> updated the RICE score
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-info-muted p-1.5 flex-shrink-0">
                      <MessageSquare className="h-3 w-3 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Jane Smith</span> added a comment
                      </p>
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-success-muted p-1.5 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Mike Johnson</span> accepted this idea
                      </p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-secondary p-1.5 flex-shrink-0">
                      <Sparkles className="h-3 w-3 text-foreground" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">AI evaluation generated</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-border p-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Secondary Actions */}
            <div className="flex items-center gap-2">
              <button
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                aria-label="Archive idea"
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-error"
                aria-label="Delete idea"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Primary Action */}
            <button className="flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Edit className="h-4 w-4" aria-hidden="true" />
              <span>Edit idea</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Slider Layout:
 * - w-[600px]: Standard width (matches modal max-w-2xl)
 * - Fixed header (border-b border-border p-6)
 * - Scrollable content (flex-1 overflow-y-auto p-6 space-y-6)
 * - Fixed footer (border-t border-border p-6)
 *
 * Tabs:
 * - border-b-2: Active tab indicator
 * - border-primary: Active tab color
 * - text-primary: Active tab text
 * - hover:text-foreground: Hover state
 *
 * Section Spacing:
 * - space-y-6: Content sections (24px)
 * - space-y-3: Subsections (12px)
 * - p-6: Header/content/footer padding (24px)
 *
 * RICE Score Card:
 * - bg-card border border-border rounded-xl p-4
 * - text-3xl font-bold: Overall score
 * - font-variant-numeric-tabular: Numeric values
 * - Icons with semantic meaning (Users, Target, TrendingUp, Clock)
 *
 * AI Evaluation:
 * - bg-card border border-border: Section containers
 * - bg-success/10 border border-success/20: Recommendation card
 * - text-success, text-warning: Semantic colors for assessment
 *
 * Activity Feed:
 * - Colored icons with muted backgrounds
 * - Timestamp with text-muted-foreground
 * - Clear visual hierarchy
 *
 * Footer Actions:
 * - Secondary actions (Archive, Delete) with icon-only buttons
 * - Primary action (Edit) with prominent button
 * - h-9: Button height (36px)
 *
 * Accessibility:
 * - role="dialog" aria-modal="true"
 * - aria-labelledby pointing to title
 * - aria-current="page" on active tab
 * - aria-label on icon buttons
 * - Icons with aria-hidden="true"
 * - Backdrop onClick closes slider
 * - Escape key should close (not shown in mockup)
 * - Focus trap within slider
 *
 * Width Consistency:
 * - w-[600px]: Matches task modal max-w-2xl (672px)
 * - Both should use same width for consistency
 * - Slider is slightly narrower due to fixed positioning constraints
 */
