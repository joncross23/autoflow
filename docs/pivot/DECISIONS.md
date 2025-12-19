# Pivot Scoping Decisions

> **Date:** December 2024
> **Total Questions:** 64

---

## Core Architecture

| Decision | Answer |
|----------|--------|
| Rebuild vs Continue | Continue from current codebase (72% reusable) |
| Migration strategy | Projects → ideas with status 'accepted' |
| Columns model | Global (shared by all ideas) |
| Default columns | Backlog, To Do, In Progress, Review, Done (5) |
| Orphan tasks | Allowed (tasks can exist without idea) |
| Status workflow | Free movement (no restrictions) |
| Labels | Ideas only (tasks inherit parent's labels) |
| Checklists | Both ideas and tasks can have checklists |
| Archive | Boolean flag (separate from status) |
| Categories | Multi-select themes (like labels) |

---

## UI/UX Decisions

| Decision | Answer |
|----------|--------|
| Primary view | Table only (replace card grid) |
| Detail panel | Right slider (Notion-style) |
| Table columns | Title, Status, Score, Updated (default visible) |
| Column resizing | Yes, draggable widths |
| Column customization | Toggle visibility, drag to reorder |
| Board filter | Sidebar with idea checkboxes |
| Quick add tasks | Both inline and slider options |
| Keyboard nav | Arrow keys + Enter (standard) |
| Bulk operations | Checkbox selection + action bar |
| Search | Global Cmd+K (ideas + tasks) |
| Filters | Full panel (status, score, date, user*) |

---

## Technical Decisions

| Decision | Answer |
|----------|--------|
| URL structure | `/ideas?selected=[id]` (query param, shareable) |
| Realtime | Manual refresh + optimistic UI |
| Mobile | Responsive web only |
| Loading states | Skeleton loaders |
| Error handling | Toast + Inline combined |
| AI trigger | Auto-evaluate on idea creation |
| AI fallback | Show error + retry button |

---

## Data & Migration

| Decision | Answer |
|----------|--------|
| Data migration | All fields + new status/effort |
| RLS policy | Team-based (add team_id now, future-ready) |
| Auto-archive | Manual only |

---

## Release & Testing

| Decision | Answer |
|----------|--------|
| Version | 1.0.0 (major release) |
| Deploy | Staging first, then production |
| Rollback | Fix forward (no rollback script) |
| E2E tests | Auth + CRUD basics |
| Dashboard focus | Idea-level metrics |

---

## Design System (From Mockups)

| Decision | Choice |
|----------|--------|
| Detail panel | Right slider (Notion-style), not center modal |
| Table rows | Rich rows with status badges, score indicators, visual elements |
| Colour tokens | Exact mockup values (--primary, --bg-secondary, etc.) |
| Mobile pattern | Bottom nav, horizontal scroll, touch-friendly targets |

### CSS Custom Properties

```css
/* Mode colours (dark/light) */
--bg: #0A0A0B / #FAFAFA
--bg-secondary: #131316 / #F4F4F5
--bg-tertiary: #1A1A1F / #E4E4E7
--bg-elevated: #1F1F26 / #FFFFFF
--border: #27272A / #D4D4D8
--border-subtle: #1F1F23 / #E4E4E7
--text: #FAFAFA / #09090B
--text-secondary: #A1A1AA / #52525B
--text-muted: #71717A / #A1A1AA

/* Accent colours (6 themes) */
midnight: #3B82F6, #2563EB, #1E3A5F
emerald: #10B981, #059669, #064E3B
sunset: #F59E0B, #D97706, #78350F
royal: #8B5CF6, #7C3AED, #4C1D95
rose: #EC4899, #DB2777, #831843
slate: #64748B, #475569, #1E293B
```

### Component Styling

- **Border radius:** 10-12px cards/panels, 8px buttons, 4-6px small elements
- **Card hover:** border → primary colour, slight shadow
- **Labels:** 20% opacity background with full colour text
- **Avatars:** Circular, initials, deterministic colour by first letter
- **Progress bars:** 4px height, rounded, primary colour fill
- **Typography:** -0.02em letter-spacing headings, 13-15px body

### Mobile Patterns

- Bottom navigation bar (not hamburger menu)
- Horizontal scroll for kanban columns (260px min-width)
- Touch-friendly drag handles
- Full-height card modals (slides up)
- Voice capture button in quick capture

---

## Ideas Table Columns

| Column | Type | Default Visible | Width |
|--------|------|-----------------|-------|
| Title | text | Yes | 300px |
| Status | badge | Yes | 120px |
| AI Score | number/badge | Yes | 80px |
| Updated At | date | Yes | 140px |
| Created At | date | No | 140px |
| Description | text | No | 200px |
| Effort Estimate | dropdown | No | 100px |
| Owner | avatar | No | 100px |
| Started At | date | No | 140px |
| Completed At | date | No | 140px |
| Themes | label chips | No | 150px |

---

## Deferred to Later Versions

| Feature | Version |
|---------|---------|
| Discovery Forms | V2.0+ |
| Tools Registry | V2.0+ |
| Team collaboration | V1.2+ |
| User filter in table | V1.2 (team_id column ready) |
| Formula fields | V2.0+ |
| Recurring cards | V2.0+ |
| Automation rules | V2.0+ |
