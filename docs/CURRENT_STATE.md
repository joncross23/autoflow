# AutoFlow — Current State

> **Repository:** https://github.com/jon-cross/autoflow
> **Vercel:** Linked to GitHub
> **Supabase:** Linked to GitHub
> **Last Updated:** 2025-12-19
> **Current Version:** 1.2.0
> **Current Phase:** V1.2 Collaboration (COMPLETE)
> **Next Phase:** Deploy & Stabilize

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

2. **Set environment variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. **Push to main** → auto-deploys via Vercel

---

## Next Steps (V1.3+)

### Remaining V1.2 Features (Optional)
| Feature | Description |
|---------|-------------|
| Attachments | Files, images on cards |
| Templates | Card + board templates |
| Voting | Simple upvote on ideas |
| Card Aging | Visual indicator for stale items |

### V1.3 — Power Features
| Feature | Description |
|---------|-------------|
| Custom Fields | User-defined fields per idea |
| Dependencies | Blocked-by relationships |
| PWA | Service worker, offline capture |

### V2.0+ — Future
| Feature | Description |
|---------|-------------|
| Discovery Forms | Questionnaire builder |
| ROI Tracking | Actual vs projected returns |
| Webhooks | n8n/Zapier integration |

---

## Session Log

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
