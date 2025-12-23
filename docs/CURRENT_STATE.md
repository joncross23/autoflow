# AutoFlow — Current State

> **Repository:** https://github.com/jon-cross/autoflow
> **Vercel:** Linked to GitHub
> **Supabase:** Linked to GitHub
> **Last Updated:** 2025-12-22
> **Current Version:** 1.6.1
> **Current Phase:** V1.6 Theme System + Safari Fixes (COMPLETE)
> **Next Phase:** Dynamic Delivery Filters

---

## V1.6 Theme System Redesign Status: COMPLETE

V1.6 introduces a unified themes system with 6 default presets, custom theme creation, and an expanded slide-out panel for live preview customisation.

### V1.6 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Theme Presets | **Done** | 6 default themes (Ocean, Forest, Ember, Midnight, Rose, Carbon) |
| Theme Preset Cards | **Done** | Visual preview cards with mini UI mockup |
| Accent Swap | **Done** | Replaced violet with indigo accent |
| Custom Themes | **Done** | Save up to 6 custom themes (localStorage) |
| Slide-out Panel | **Done** | 50% width panel for live theme customisation |
| Eyedropper Tool | **Done** | Pick colours from screen (Chrome/Edge only) |
| Gradient Presets | **Done** | 6 preset gradients for backgrounds |
| Custom Gradients | **Done** | Save up to 6 custom gradients |

### New Files (V1.6)

| File | Description |
|------|-------------|
| `src/lib/themes/presets.ts` | 6 default theme preset definitions |
| `src/components/theme/ThemePresetCard.tsx` | Visual theme preview card component |
| `src/components/theme/EyedropperButton.tsx` | Eyedropper with graceful degradation |
| `src/components/ui/SlideOutPanel.tsx` | Reusable slide-out panel component |
| `src/types/theme.ts` | Custom theme type definitions |

### Modified Files (V1.6)

| File | Changes |
|------|---------|
| `src/lib/themes/index.ts` | Updated Accent type (violet → indigo), added legacy mapping |
| `src/components/theme/ThemeProvider.tsx` | Added theme preset state, custom colours/gradients/themes |
| `src/components/theme/AppearanceSettings.tsx` | Complete redesign with themes grid, slide-out panel |

---

## V1.5 Task Relationships & Progress Status: COMPLETE

V1.5 adds task-to-task relationship types (Jira-style) and idea task progress tracking.

### V1.5 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Relationship Types | **Done** | Task-to-task links with types: blocks, is blocked by, duplicates, etc. |
| Relationship Dropdown | **Done** | Select relationship when linking tasks |
| Display Order Swap | **Done** | Shows "is blocked by [taskname]" format |
| Quick Search | **Done** | Sticky search in task/idea link dropdown |
| Backlinks Inverse | **Done** | Backlinks show inverse relationship labels |
| Progress Column | **Done** | Toggleable progress column in Ideas table |
| Progress API | **Done** | `getAllIdeasTaskProgress()` for bulk progress data |

### Database Migration (V1.5)

| File | Description |
|------|-------------|
| `20241221_add_link_relationship_type.sql` | Adds `relationship_type` column to links table |

**✅ COMPLETE:** Migration and RLS policies applied.

### Modified Components (V1.5)

| Component | Changes |
|-----------|---------|
| `LinksSection.tsx` | Added relationship dropdown, sticky search, "relationship [taskname]" display |
| `BacklinksSection.tsx` | Shows inverse relationship labels |
| `IdeasTableRow.tsx` | Added progress column with bar and count |
| `IdeasTable.tsx` | Added "Progress" to COLUMN_LABELS |
| `ideas/page.tsx` | Loads progress data, added progress column config |

### New API Functions (V1.5)

| Function | Location | Description |
|----------|----------|-------------|
| `getIdeaTaskProgress` | `src/lib/api/ideas.ts` | Get progress for single idea |
| `getAllIdeasTaskProgress` | `src/lib/api/ideas.ts` | Get progress for all ideas (bulk) |

### Types Added (V1.5)

| Type | Location | Description |
|------|----------|-------------|
| `LinkRelationshipType` | `src/types/database.ts` | Union type for relationship types |
| `RELATIONSHIP_TYPE_PAIRS` | `src/types/database.ts` | Maps relationships to inverses |
| `RELATIONSHIP_TYPE_LABELS` | `src/types/database.ts` | Human-readable labels |
| `IdeaTaskProgress` | `src/lib/api/ideas.ts` | Progress info interface |

---

## V1.4 TaskDetailModal Redesign Status: COMPLETE

V1.4 focused on modal redesign with UI polish, enhanced linking, and AI features.

### V1.4 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Labels Accessibility | **Done** | Solid coloured backgrounds with white text (WCAG AA) |
| Button Hover States | **Done** | Background hover on sidebar buttons |
| Close Button Visibility | **Done** | Increased opacity and size |
| Modal Close Position | **Done** | Repositioned to top-right corner |
| Remove Separators | **Done** | Cleaner look without section dividers |
| Empty Sections | **Done** | Only show sections with data |
| Label Picker Redesign | **Done** | Trello-style full-width bars with checkboxes |
| Unified Linking | **Done** | Single LinksSection for ideas, tasks, URLs |
| Backlinks Section | **Done** | Shows links pointing TO this entity |
| AI Rename | **Done** | "AI Suggestions" → "AI Analysis" |
| AI Manual Trigger | **Done** | Removed auto-trigger, manual only |
| Activity in Sidebar | **Done** | Moved to bottom of right sidebar |
| Simple New Card | **Done** | Title + Description only on creation |
| AI Description | **Done** | "Create with AI" button for description generation |
| Actions Section | **Done** | Trello-style: Move, Copy, Watch, Archive, Share |

---

## V1.3 Rich Cards Status: COMPLETE

V1.3 adds rich card editing with Labels, Checklists, Attachments, Links, and AI Suggestions on both Ideas and Tasks.

### V1.3 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Wider Panels | **Done** | IdeaDetailSlider and TaskDetailModal widened to 50% |
| Labels | **Done** | User-scoped labels with hex colours on ideas and tasks |
| Checklists on Ideas | **Done** | Ideas can now have their own checklists |
| Attachments | **Done** | File uploads for ideas and tasks (Supabase Storage) |
| Links | **Done** | External links with emoji favicons |
| AI Task Suggestions | **Done** | Task-level AI analysis with subtask/blocker/tip suggestions |
| Click-to-Edit Cards | **Done** | TaskCard click anywhere opens modal (edit removed from dropdown) |

### Database Migration (V1.3)

| File | Description |
|------|-------------|
| `supabase-v1.3-rich-cards.sql` | Labels, idea_labels, task_labels, attachments, links tables + priority column on tasks |

### New Components (V1.3)

| Component | Location | Description |
|-----------|----------|-------------|
| `LabelsSection` | `src/components/shared/LabelsSection.tsx` | Labels display with create/add/remove |
| `ChecklistsSection` | `src/components/shared/ChecklistsSection.tsx` | Checklists for ideas and tasks |
| `AttachmentsSection` | `src/components/shared/AttachmentsSection.tsx` | File upload with drag-drop |
| `LinksSection` | `src/components/shared/LinksSection.tsx` | External links management |
| `AISuggestionsSection` | `src/components/shared/AISuggestionsSection.tsx` | Task-level AI suggestions |

### New API Functions (V1.3)

| Function | Location | Description |
|----------|----------|-------------|
| `getIdeaChecklists` | `src/lib/api/checklists.ts` | Get checklists for an idea |
| `createIdeaChecklist` | `src/lib/api/checklists.ts` | Create checklist on an idea |
| `getIdeaAttachments` | `src/lib/api/attachments.ts` | Get attachments for an idea |
| `uploadIdeaAttachment` | `src/lib/api/attachments.ts` | Upload file to idea |
| `getIdeaLinks` | `src/lib/api/links.ts` | Get links for an idea |
| `createIdeaLink` | `src/lib/api/links.ts` | Add link to idea |
| `/api/tasks/[id]/analyse` | API route | Task-level AI analysis endpoint |

---

## V1.2 Collaboration Status: COMPLETE

V1.2 adds collaboration features: threaded comments on ideas, activity logging with automatic change tracking, and a keyboard shortcuts panel.

### V1.2 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Comments | **Done** | Threaded comments on ideas with replies |
| Activity Log | **Done** | Automatic change tracking via database triggers |
| Keyboard Shortcuts | **Done** | Press `?` to show all shortcuts |

### Database Migrations (V1.2)

| File | Description |
|------|-------------|
| `supabase-v1.2-comments.sql` | Comments table with threading, RLS policies |
| `supabase-v1.2-activity-log.sql` | Activity log with auto-triggers for idea changes |

### New Components (V1.2)

| Component | Location | Description |
|-----------|----------|-------------|
| `CommentsSection` | `src/components/ideas/CommentsSection.tsx` | Threaded comments UI |
| `ActivityLog` | `src/components/ideas/ActivityLog.tsx` | Activity history display |
| `KeyboardShortcutsPanel` | `src/components/shared/KeyboardShortcutsPanel.tsx` | Shortcuts modal |

### New API Functions (V1.2)

| Function | Location | Description |
|----------|----------|-------------|
| `getIdeaComments` | `src/lib/api/comments.ts` | Get threaded comments for an idea |
| `createComment` | `src/lib/api/comments.ts` | Create a new comment |
| `updateComment` | `src/lib/api/comments.ts` | Edit a comment |
| `deleteComment` | `src/lib/api/comments.ts` | Delete a comment |
| `getIdeaActivity` | `src/lib/api/activity.ts` | Get activity log for an idea |
| `getRecentActivity` | `src/lib/api/activity.ts` | Get recent user activity |

---

## V1.1 Scoring & Views Status: COMPLETE

### V1.1 Features

| Feature | Status | Description |
|---------|--------|-------------|
| RICE Scoring | **Done** | Manual Reach/Impact/Confidence/Effort scoring |
| Matrix View | **Done** | Impact vs Effort prioritization chart |
| Saved Filter Views | **Done** | Named filter presets |
| Published Views | **Done** | Shareable read-only URLs |
| Time Audit | **Done** | Recoverable hours report at `/dashboard/time-audit` |
| Now/Next/Later | **Done** | Planning horizon field on ideas |

### Database Migration (V1.1)

| File | Description |
|------|-------------|
| `supabase-v1.1-rice-scoring.sql` | RICE fields, saved_views, published_views tables |
| `supabase-v1.1-horizon.sql` | Planning horizon (now/next/later) field |

---

## V1.0 Pivot Status: COMPLETE

The V1.0 "Table-First" pivot merged Projects into Ideas with an extended status workflow.

### Key Changes

| Change | Description |
|--------|-------------|
| Unified Ideas Model | Projects merged into Ideas with extended status |
| Global Columns | Columns are user-scoped (not project-scoped) |
| Status Workflow | new → evaluating → accepted → doing → complete (+ parked/dropped) |
| Delivery Board | Single kanban with idea filter sidebar |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Main dashboard with idea metrics |
| `/dashboard/ideas` | Ideas table with filters, bulk ops |
| `/dashboard/delivery` | Unified delivery board |
| `/dashboard/matrix` | Impact vs Effort prioritization |
| `/dashboard/time-audit` | Recoverable hours report |
| `/dashboard/settings` | Theme + account settings |
| `/share/[slug]` | Public shared views |

---

## Deployment Checklist

See `DEPLOY_CHECKLIST.md` for full instructions.

### Quick Steps

1. **Run migrations in Supabase** (in order):
   - `supabase-v1.1-rice-scoring.sql`
   - `supabase-v1.1-horizon.sql`
   - `supabase-v1.2-comments.sql`
   - `supabase-v1.2-activity-log.sql`
   - `supabase-v1.3-rich-cards.sql`

2. **Set environment variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. **Push to main** → auto-deploys via Vercel

---

## Known Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| AI Suggestions Fail | Medium | "Failed to get AI suggestions" error in TaskDetailModal. Likely missing/invalid ANTHROPIC_API_KEY in Vercel. |
| Attachments Bucket | Low | Supabase Storage bucket `attachments` needs to be manually created in dashboard. |

### Optimisation Opportunities

- Add database indexes for common queries
- Implement query batching for related data (labels, checklists, etc.)
- Add skeleton loading states for smoother UX
- Consider React Query for caching and deduplication

---

## Next Steps (V1.6+)

### V1.6 — Dynamic Delivery Filters (PLANNED)
| Feature | Description |
|---------|-------------|
| Smart Filter Chips | Dynamic add/remove filters (like Notion/Linear) |
| Multi-Criteria Filtering | Filter by linked idea, labels, due date, priority |
| URL-Persisted Filters | Shareable filtered board URLs |
| Auto-Link on Task Create | Creating task from idea also creates link record |

### V1.7+ — Power Features
| Feature | Description |
|---------|-------------|
| Time Tracking | Track time spent on tasks |
| Custom Fields | User-defined fields per idea |
| PWA | Service worker, offline capture |
| Bulk Edit | Edit multiple cards at once |

### V2.0+ — Future
| Feature | Description |
|---------|-------------|
| Templates | Card + board templates |
| Voting | Simple upvote on ideas |
| Card Aging | Visual indicator for stale items |
| Discovery Forms | Questionnaire builder |
| ROI Tracking | Actual vs projected returns |
| Webhooks | n8n/Zapier integration |

---

## Session Log

### 2025-12-22 — V1.6.1 Safari File Uploads & Preview
- Fixed Safari/WebKit file upload bug using XMLHttpRequest instead of fetch
- Created API route `/api/attachments/upload` for server-side file handling
- Added ownership verification in API route before upload
- Added file preview modal for images and PDFs (click to view)
- Fixed sidebar labels: "Attachment" → "Attachments", "Link" → "Links"
- Added RLS policy migration for task attachments via project ownership
- Simplified attachments RLS policy to `uploaded_by = auth.uid()` for inserts
- Deployed to Vercel production

### 2025-12-22 — V1.6 Theme System Redesign
- Implemented 6 default theme presets (Ocean, Forest, Ember, Midnight, Rose, Carbon)
- Created ThemePresetCard component with mini UI mockup preview
- Added SlideOutPanel component (50% width, no backdrop for live preview)
- Replaced violet accent with indigo across the codebase
- Added EyedropperButton with graceful degradation for unsupported browsers
- Custom themes save/delete (up to 6, localStorage)
- Custom gradients save/delete (up to 6, localStorage)
- Gradient presets for quick background selection
- Redesigned AppearanceSettings with themes grid and customise panel
- Widened slide-out panel to 50% screen width, max 1000px
- Removed Preview section from customise panel
- Reduced gradient bar heights by 10% (h-12 → h-11)
- Added bottom padding to Save section in panel
- Diagnosed Supabase outage causing dashboard/ideas/tasks pages to hang

### 2025-12-21 — V1.5 Task Relationships & Progress + Delivery Search
- Added `relationship_type` column migration for links table
- Implemented relationship dropdown when linking tasks (blocks, is blocked by, etc.)
- Added sticky search input at top of task/idea dropdown
- Swapped display order to show "is blocked by [taskname]" format
- Updated BacklinksSection to show inverse relationship labels
- Added Progress column to Ideas table (toggleable, hidden by default)
- Created `getIdeaTaskProgress` and `getAllIdeasTaskProgress` API functions
- Fixed conditional insert in `createTaskLink` to avoid errors when column doesn't exist
- Added RLS policies for links table (SELECT, INSERT, UPDATE, DELETE)
- **Added search bar to Delivery Board** — filters cards by title, description, linked idea, and labels
- **Fixed backlinks navigation** — delivery page now handles `?task=` parameter, auto-opens task modal
- Compact single-row layout for search + filter chips
- Deployed to staging and production

### 2025-12-20 — V1.4 TaskDetailModal Redesign Complete
- UI Polish: Labels accessibility, button hovers, close button visibility
- Removed section separators for cleaner look
- Redesigned label picker to Trello-style with full-width bars and checkboxes
- Enhanced LinksSection with type selector (URL, Idea, Task)
- Added BacklinksSection showing links pointing TO this entity
- Renamed "AI Suggestions" to "AI Analysis", made trigger manual only
- Moved Activity section to bottom of right sidebar
- Added "Create with AI" for description generation
- Added Actions section (Move, Copy, Watch, Archive, Share)
- Simplified new card view to Title + Description only

### 2025-12-19 — V1.3 Bugfixes
- Fixed: TaskCard click now opens TaskDetailModal (was missing handler in DeliveryBoard)
- Fixed: Labels column now available in Ideas table (added to column options)
- Added: Labels fetched in bulk for Ideas table performance
- Added: Known issues section documenting AI suggestions error and performance

### 2025-12-19 — V1.3 Rich Cards Complete
- Widened IdeaDetailSlider and TaskDetailModal to 50% width
- Added Labels system with hex colours on ideas and tasks
- Added Checklists support for Ideas (in addition to Tasks)
- Added Attachments with Supabase Storage integration
- Added Links with emoji favicons
- Added AI Suggestions for tasks with new `/api/tasks/[id]/analyse` endpoint
- TaskCard click anywhere opens modal (removed edit from dropdown)
- Version bumped to 1.3.0

### 2025-12-19 — V1.2 Collaboration Complete
- Added Comments system with threaded replies
- Added Activity Log with automatic database triggers
- Added Keyboard Shortcuts panel (press `?`)
- Created Time Audit page at `/dashboard/time-audit`
- Added Now/Next/Later planning horizon to ideas
- Version bumped to 1.2.0

### 2025-12-19 — V1.1 Scoring & Views Complete
- RICE scoring with auto-calculated scores
- Matrix View for prioritization
- Saved and Published views for sharing
- Time Audit for recoverable hours analysis
- Planning horizon (Now/Next/Later)

### 2025-12-19 — V1.0 Pivot Complete
- Table-first architecture implemented
- Global delivery board
- Extended status workflow
- Command palette search
