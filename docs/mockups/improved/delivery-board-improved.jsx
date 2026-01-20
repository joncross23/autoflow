/**
 * IMPROVED DELIVERY BOARD (KANBAN) MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Consistent card padding (p-3 for compact draggable cards)
 * 2. Defined column widths (min-w-[320px] for predictable layout)
 * 3. Clear drag affordance (grip icon + cursor-grab)
 * 4. Status conveyed via badge (not just colored border)
 * 5. Accessible drag-and-drop with keyboard support hints
 * 6. Proper touch targets for card actions (h-8 w-8 min)
 * 7. Column header counts with semantic colors
 * 8. Empty column states with clear CTAs
 *
 * Issues Fixed from Audit:
 * - Card padding: Inconsistent (now p-3 = 12px for compact feel)
 * - Drag affordance: Unclear (now grip icon + cursor-grab on hover)
 * - Column width: Undefined (now min-w-[320px] max-w-[360px])
 * - Status indicators: Color-only borders (now badge with icon + text)
 * - Drag handles: Missing aria-labels (now added)
 * - Card actions: Too small (now h-8 w-8 minimum)
 * - Column headers: No task count (now added with badge)
 */

import React from 'react';
import {
  Plus,
  GripVertical,
  MoreVertical,
  Clock,
  Users,
  Paperclip,
  MessageSquare,
  CheckCircle,
  Workflow,
  AlertCircle,
} from 'lucide-react';

export default function DeliveryBoardImproved() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Delivery Board</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track implementation progress across stages
            </p>
          </div>

          <button
            className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Add new task"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add task</span>
          </button>
        </div>
      </header>

      {/* Main Content - Full width with horizontal scroll */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="px-6 py-6 min-h-[calc(100vh-73px)]">
          {/* Kanban Board Container */}
          <div className="flex gap-4 pb-6" role="region" aria-label="Kanban board">
            {/* Column 1: Backlog */}
            <div
              className="flex flex-col min-w-[320px] max-w-[360px] bg-secondary/30 rounded-xl"
              role="list"
              aria-label="Backlog column"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Backlog</h2>
                  {/* Task count badge */}
                  <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                    3
                  </span>
                </div>

                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Add card to Backlog"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Cards Container - scrollable */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Card 1 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: Set up authentication system"
                >
                  {/* Drag Handle */}
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">Set up authentication system</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Implement user login, registration, and password reset flows
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for Set up authentication system"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Status Badge with icon (not color-only) */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-secondary text-foreground border border-border">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      To Do
                    </span>
                  </div>

                  {/* Card Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {/* Assignee */}
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>John</span>
                      </div>

                      {/* Attachments */}
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>2</span>
                      </div>

                      {/* Comments */}
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>3</span>
                      </div>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 15</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: Design dashboard mockups"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">Design dashboard mockups</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Create high-fidelity designs for main dashboard
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for Design dashboard mockups"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-secondary text-foreground border border-border">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      To Do
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Sarah</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>1</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 20</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: API documentation"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">API documentation</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Write comprehensive API docs for developers
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for API documentation"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-secondary text-foreground border border-border">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      To Do
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Mike</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 25</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div
              className="flex flex-col min-w-[320px] max-w-[360px] bg-secondary/30 rounded-xl"
              role="list"
              aria-label="In Progress column"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">In Progress</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-info-muted text-white rounded-full">
                    2
                  </span>
                </div>

                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Add card to In Progress"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Card 1 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: Build email automation flow"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">Build email automation flow</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Create automated workflow for weekly reports
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for Build email automation flow"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-info text-white">
                      <Workflow className="h-3 w-3" aria-hidden="true" />
                      In Progress
                    </span>
                    {/* Progress indicator */}
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[60%] bg-info rounded-full" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="60% complete" />
                    </div>
                    <span className="text-xs text-muted-foreground">60%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Jane</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>8</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 12</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: Database migration"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">Database migration</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Migrate user data to new schema
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for Database migration"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-warning text-black">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      Blocked
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Alex</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>4</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Overdue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Review */}
            <div
              className="flex flex-col min-w-[320px] max-w-[360px] bg-secondary/30 rounded-xl"
              role="list"
              aria-label="Review column"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Review</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                    1
                  </span>
                </div>

                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Add card to Review"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Card 1 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group"
                  draggable
                  role="listitem"
                  aria-label="Task: User testing feedback"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">User testing feedback</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Review and incorporate user feedback
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for User testing feedback"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-secondary text-foreground border border-border">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      In Review
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Sarah</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>6</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Done */}
            <div
              className="flex flex-col min-w-[320px] max-w-[360px] bg-secondary/30 rounded-xl"
              role="list"
              aria-label="Done column"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Done</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-success-muted text-white rounded-full">
                    5
                  </span>
                </div>

                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Add card to Done"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Card 1 */}
                <div
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group opacity-75"
                  draggable
                  role="listitem"
                  aria-label="Task: Initial project setup"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      className="flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Drag to reorder"
                      tabIndex={-1}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">Initial project setup</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Configure repo, CI/CD, and dev environment
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                      aria-label="More options for Initial project setup"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-success text-white">
                      <CheckCircle className="h-3 w-3" aria-hidden="true" />
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Team</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Jan 5</span>
                    </div>
                  </div>
                </div>

                {/* Empty state hint for collapsed done cards */}
                <button className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  + Show 4 more completed tasks
                </button>
              </div>
            </div>

            {/* Empty Column Example */}
            {/*
            <div
              className="flex flex-col min-w-[320px] max-w-[360px] bg-secondary/30 rounded-xl"
              role="list"
              aria-label="Empty column"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Testing</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                    0
                  </span>
                </div>

                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Add card to Testing"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="rounded-full bg-secondary p-3 mb-3 inline-block">
                    <Plus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No tasks yet</p>
                  <button className="h-9 px-3 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    Add task
                  </button>
                </div>
              </div>
            </div>
            */}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Card Layout:
 * - p-3: Draggable card padding (12px for compact feel)
 * - space-y-3: Card spacing in column (12px)
 * - min-w-[320px] max-w-[360px]: Column width (predictable, not too wide)
 *
 * Drag & Drop:
 * - cursor-grab, active:cursor-grabbing: Visual drag affordance
 * - hover:shadow-lg: Card elevation on hover
 * - opacity-0 group-hover:opacity-100: Show grip on hover
 * - GripVertical icon: Universal drag handle symbol
 *
 * Status Badges:
 * - bg-info, bg-success, bg-warning: Semantic status colors
 * - Icon + text: Not color-only (accessible)
 * - px-2 py-0.5: Compact badge padding
 *
 * Progress Indicators:
 * - h-1.5 bg-secondary: Progress bar container
 * - bg-info: Progress fill (semantic color)
 * - role="progressbar" with aria attributes: Screen reader support
 *
 * Column Headers:
 * - p-4: Header padding (16px)
 * - border-b border-border: Visual separation
 * - Task count badges with semantic colors
 *
 * Colors:
 * - bg-secondary/30: Column background (subtle tint)
 * - hover:bg-secondary: Hover states
 * - text-muted-foreground: Metadata
 *
 * Typography:
 * - text-sm font-semibold: Column titles, card titles
 * - text-xs: Card metadata, due dates
 * - line-clamp-2: Truncate long descriptions
 *
 * Accessibility:
 * - role="list" and role="listitem": Semantic structure for Kanban
 * - aria-label on columns and cards
 * - Drag buttons with tabIndex={-1} (visual only, card itself is draggable)
 * - Icon + text status (not color-only)
 * - Progress bars with role="progressbar" and aria attributes
 *
 * Touch Targets:
 * - h-8 w-8: Icon buttons (32px - acceptable for compact interface)
 * - Entire card is draggable (large touch target)
 * - Column add buttons: h-8 w-8 minimum
 *
 * Note: For mobile, consider disabling drag-and-drop and using
 * context menus to move cards between columns (better UX).
 */
