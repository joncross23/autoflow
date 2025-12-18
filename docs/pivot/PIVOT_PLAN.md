# AutoFlow Pivot Plan — V1.0

> **Target Version:** 1.0.0
> **Branch:** `pivot`
> **Status:** Implementation Phase

---

## Summary

This pivot shifts AutoFlow from "Kanban-First" to "Table-First" architecture, unifying Ideas and Projects into a single entity.

### Key Changes

| Before | After |
|--------|-------|
| Separate Ideas and Projects tables | Unified Ideas with status workflow |
| Per-project kanban boards | Single Delivery Board for all tasks |
| Card grid as primary Ideas view | Table as primary Ideas view |
| Modal for card details | Right slider for idea details |
| Board-specific columns | Global columns (shared by all ideas) |

---

## V1.0 MVP Features

| Feature | Description |
|---------|-------------|
| Database migration | Projects → Ideas, global columns, idea_id on tasks |
| Ideas Table | Sortable, resizable, customizable columns |
| Column Customization | Toggle visibility, drag to reorder, persist to localStorage |
| Idea Detail Slider | Right panel (Notion-style) with status, AI score, themes |
| Delivery Board | Single kanban with idea filter sidebar |
| Global Search | Cmd+K across ideas and tasks |
| Status Workflow | Free movement: new → evaluating → accepted → doing → complete (+ parked/dropped) |
| Basic Filtering | Status, archived toggle, date range |
| Bulk Operations | Checkbox + action bar (archive, delete, status change) |
| AI Evaluation | Auto-evaluate on creation, retry button |

---

## Implementation Phases

### Phase 1: Database Migration
- Add new columns to ideas table (status, effort_estimate, owner_id, team_id, archived, started_at, completed_at)
- Migrate projects → ideas with status 'accepted'
- Make columns global (remove project_id, add user_id)
- Update tasks.project_id → tasks.idea_id
- Add themes table
- Update TypeScript types

### Phase 2: API Layer Updates
- Update ideas.ts with status field and transitions
- Update tasks.ts with idea_id references
- Update columns.ts for global columns
- Create themes.ts
- Delete projects.ts

### Phase 3: Ideas Table View
- Create IdeasTable with sortable, resizable columns
- Create StatusBadge, FilterPanel, BulkActionBar
- Handle ?selected=[id] query param

### Phase 4: Idea Detail Slider
- Create IdeaDetailSlider with full idea management
- Create IdeaTasksSection, IdeaChecklistSection
- Keyboard shortcuts, URL sync

### Phase 5: Delivery Board
- Create unified kanban board
- Add idea filter sidebar
- Update TaskCard with idea badge

### Phase 6: Global Search
- Create CommandPalette (Cmd+K)
- Search ideas and tasks
- Recent items section

### Phase 7: Navigation, Dashboard & Cleanup
- Update sidebar navigation
- Update dashboard metrics
- Delete deprecated code
- E2E tests

---

## Design System

Uses exact mockup values from Phase 0.5:

- **Detail panel:** Right slider (Notion-style)
- **Table rows:** Rich rows with status badges, score indicators
- **Colour tokens:** Exact mockup CSS variables
- **Mobile:** Bottom nav, horizontal scroll, touch-friendly

See [DECISIONS.md](./DECISIONS.md) for full design decisions.

---

## Future Versions

| Version | Focus |
|---------|-------|
| V1.1 | RICE Scoring, Matrix View, Published Views, Saved Filters |
| V1.2 | Insights, Attachments, Comments, Templates, Voting |
| V1.3 | Custom Fields, Version History, Dependencies, PWA |
| V2.0+ | Discovery Forms, Tools Registry, AI Conversation, ROI Tracking |

---

## Success Criteria

1. Ideas table is primary view with sorting/filtering/resizing
2. Clicking idea opens slider, URL shows ?selected=[id]
3. Tasks reference idea_id (orphans allowed)
4. Single delivery board with idea filter sidebar
5. Status workflow: free movement between all states
6. Global Cmd+K search across ideas and tasks
7. Bulk operations via checkbox + action bar
8. Skeleton loaders, toast+inline errors
9. E2E tests pass (auth + CRUD)
10. Build passes, version 1.0.0
