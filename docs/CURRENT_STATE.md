# AutoFlow — Current State

> **Repository:** https://github.com/jon-cross/autoflow
> **Vercel:** Linked to GitHub
> **Supabase:** Linked to GitHub
> **Last Updated:** 2025-12-19
> **Current Version:** 1.0.0
> **Current Phase:** V1.0 Pivot (COMPLETE)
> **Previous Phase:** 6.5 — Task Kanban & Import

---

## V1.0 Pivot Status: COMPLETE

The V1.0 "Table-First" pivot has been implemented. This major refactoring moves from a Kanban-first, project-centric model to a unified Ideas model with a global delivery board.

### Key Changes

| Change | Description |
|--------|-------------|
| Unified Ideas Model | Projects merged into Ideas with extended status workflow |
| Global Columns | Columns are now user-scoped (not project-scoped) |
| Task References | Tasks now reference `idea_id` directly (not just `project_id`) |
| Status Workflow | new → evaluating → accepted → doing → complete (+ parked/dropped) |
| Navigation | Projects replaced with Delivery board |
| Dashboard | Updated to show idea-level metrics |

### Deleted Components

| File | Reason |
|------|--------|
| `src/lib/api/projects.ts` | Replaced by ideas.ts with extended status |
| `src/app/dashboard/projects/` | Replaced by `/dashboard/delivery` |
| `src/components/projects/KanbanBoard.tsx` | Legacy project kanban |
| `src/components/projects/KanbanColumn.tsx` | Legacy project column |
| `src/components/projects/ProjectCard.tsx` | Replaced by idea flow |
| `src/components/projects/ProjectForm.tsx` | No longer needed |

### Database Migration

Run `supabase-v1.0-pivot-migration.sql` to apply:
- Extended `idea_status` enum with: accepted, doing, complete, parked, dropped
- Added columns to ideas: archived, effort_estimate, owner, team_id, started_at, completed_at
- Added `user_id` to columns table (global columns)
- Added `idea_id` to tasks table
- Created themes and idea_themes tables
- Updated RLS policies for tasks, checklists, checklist_items

### Additional RLS Fixes Required

After running the main migration, run these additional RLS policy updates:

1. **Tasks RLS** - Allow task creation/viewing via idea ownership
2. **Checklists RLS** - Support idea-based tasks
3. **Checklist Items RLS** - Support idea-based tasks

### Data Migration Required

After schema changes, migrate existing tasks to global columns:
```sql
-- Migrate tasks from project columns to global columns (match by position)
UPDATE tasks t
SET column_id = gc.id
FROM columns pc
JOIN projects p ON pc.project_id = p.id
JOIN columns gc ON gc.user_id = p.user_id
  AND gc.project_id IS NULL
  AND gc.position = pc.position
WHERE t.column_id = pc.id
  AND pc.project_id IS NOT NULL;
```

---

## Progress Summary

### V1.0 Pivot Phases (COMPLETE)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Database Migration | **Done** | Extended ideas, global columns, task references |
| Phase 2: API Layer Updates | **Done** | Updated ideas.ts, columns.ts, removed projects.ts |
| Phase 3: Ideas Table View | **Done** | Sortable, filterable table with bulk operations |
| Phase 4: Idea Detail Slider | **Done** | Right panel with status, tasks, AI evaluation |
| Phase 5: Delivery Board | **Done** | Unified kanban with idea filter sidebar |
| Phase 6: Global Search | **Done** | Cmd+K command palette for ideas and tasks |
| Phase 7: Navigation & Cleanup | **Done** | Sidebar, dashboard, deprecated code removal |

### Pre-Pivot Phases (COMPLETE)

| Phase | Status |
|-------|--------|
| Phase 0.5 — Design Sprint | Complete |
| Phase 0 — Foundation | Complete |
| Phase 1 — Theme Implementation | Complete |
| Phase 2 — Authentication | Complete |
| Phase 3 — Idea Capture | Complete |
| Phase 4 — AI Evaluation | Complete |
| Phase 5 — Projects & Kanban | Complete (now deprecated) |
| Phase 6 — Polish & Deploy | Complete |
| Phase 6.5 — Task Kanban & Import | Complete |

---

## What's Now Available

### Running the App
```bash
npm run dev    # Start development server at http://localhost:3000
npm run build  # Production build
npm run test   # Run tests with Vitest
```

### Pages
- `/` — Landing page with feature cards
- `/login` — Sign in page (email/password)
- `/register` — Create account page
- `/forgot-password` — Password reset request
- `/dashboard` — Main dashboard with idea-level stats (protected)
- `/dashboard/ideas` — Ideas table with CRUD, filtering, bulk operations (protected)
- `/dashboard/delivery` — Unified delivery board with idea filtering (protected)
- `/dashboard/settings` — Theme + account settings with profile (protected)

### Key Components

#### Ideas (`src/components/ideas/`)
- `IdeasTable` — Sortable table with column visibility
- `IdeasTableRow` — Table row with inline status badge
- `IdeaDetailSlider` — Right panel for idea details
- `IdeaTasksSection` — Tasks within an idea
- `StatusBadge` — Status indicator with all workflow states
- `FilterPanel` — Status, score, archived filters
- `BulkActionBar` — Multi-select actions

#### Delivery (`src/components/delivery/`)
- `DeliveryBoard` — Unified kanban with idea filter sidebar

#### Search (`src/components/search/`)
- `CommandPalette` — Global Cmd+K search

#### Projects (`src/components/projects/`)
- `TaskKanbanBoard` — Drag-drop kanban board
- `TaskColumn` — Droppable column with WIP indicator
- `TaskCard` — Sortable task card with labels
- `TaskDetailModal` — Task editing modal
- `TaskListView` — List view alternative

---

## Next Steps (V1.1+)

### V1.1 — Scoring & Views
| Feature | Description |
|---------|-------------|
| RICE Scoring | Manual Reach/Impact/Confidence/Effort + hybrid with AI |
| Matrix View | X-Y prioritisation plot (Impact vs Effort) |
| Published Views | Shareable read-only URLs for stakeholders |
| Saved Filter Views | Named filter presets, quick switch |

### V1.2 — Collaboration
| Feature | Description |
|---------|-------------|
| Comments | Threaded discussion on ideas/tasks |
| Activity Log | Change history per item |
| Attachments | Files, images, documents on cards |
| Templates | Card + board templates |

### V1.3 — Power Features
| Feature | Description |
|---------|-------------|
| Custom Fields | Text, number, dropdown, checkbox, date per board |
| Dependencies | Blocked-by relationships between cards |
| PWA | Service worker, offline capture |

---

## Architectural Decisions Made

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-19 | V1.0 Pivot to Table-First | Ideas as primary entity, better for triage workflow |
| 2025-12-19 | Global columns (user-scoped) | Single delivery board across all ideas |
| 2025-12-19 | Extended idea status | new/evaluating/accepted/doing/complete/parked/dropped |
| 2025-12-19 | Tasks reference ideas directly | More flexible, supports orphan tasks |
| 2024-12-16 | Dark mode as default | User preference, modern aesthetic |
| 2024-12-16 | dnd-kit for drag-drop | Best React DnD library, accessible |

---

## Session Log

### 2025-12-19 — V1.0 Pivot Complete
- Completed all 7 phases of the V1.0 "Table-First" pivot
- Removed priority field from ideas (not in new schema)
- Added defensive fallback to StatusBadge for unknown statuses
- Created comprehensive database migration: `supabase-v1.0-pivot-migration.sql`
- Updated RLS policies for tasks, checklists, checklist_items to support idea-based access
- Migrated tasks from project-scoped columns to global columns
- Deleted deprecated project files and routes
- Updated navigation: Projects → Delivery
- Updated dashboard to show idea-level metrics
- Version bumped to 1.0.0

### 2025-12-18 — Version 0.2.0 Kanban Styling & Checklist Progress
- Updated kanban board styling to match mockup designs
- Added checklist progress display on task cards
- Task cards now show progress bars, due dates, and checklist indicators

### 2025-12-17 — Phase 6.5 Task Kanban & Import Complete
- Created /dashboard/projects/[id] page for viewing project tasks
- Built TaskKanbanBoard component with dynamic columns from database
- Created import-backlog.ts script to seed database from JSON

---

## Deployment Checklist

1. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

2. Run database migrations in Supabase:
   - `supabase-phase-0-migration.sql` (if not already run)
   - `supabase-v1.0-pivot-migration.sql` (V1.0 schema changes)
   - Additional RLS policy updates (see above)

3. Push to main branch → auto-deploys via Vercel
