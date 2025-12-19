# AutoFlow V1.2 Deployment Checklist

## Pre-Deployment

### 1. Run Database Migrations (in order)

Run these in Supabase SQL Editor:

```bash
# Check which migrations have been applied by looking at your schema
# Then run any missing ones in order:
```

| Migration | File | Description |
|-----------|------|-------------|
| V1.1a | `supabase-v1.1-rice-scoring.sql` | RICE scoring fields, saved/published views |
| V1.1b | `supabase-v1.1-horizon.sql` | Now/Next/Later planning horizon |
| V1.2a | `supabase-v1.2-comments.sql` | Threaded comments on ideas |
| V1.2b | `supabase-v1.2-activity-log.sql` | Activity tracking with auto-triggers |

### 2. Verify Migrations

Run this query in Supabase to verify all tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ideas', 'tasks', 'columns', 'comments', 'activity_log', 'saved_views', 'published_views');
```

Expected: 7 tables

### 3. Verify RICE Columns

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ideas' AND column_name LIKE 'rice_%';
```

Expected: rice_reach, rice_impact, rice_confidence, rice_effort, rice_score

### 4. Verify Horizon Column

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ideas' AND column_name = 'horizon';
```

Expected: horizon

## Build & Deploy

### 5. Run Production Build

```bash
npm run build
```

Should complete with no errors.

### 6. Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 7. Deploy

```bash
git add -A
git commit -m "feat: V1.2 release - comments, activity log, keyboard shortcuts"
git push origin main
```

Vercel will auto-deploy from main branch.

## Post-Deployment

### 8. Smoke Test Checklist

- [ ] Can log in
- [ ] Can create new idea
- [ ] Can view Ideas table
- [ ] Can open idea detail slider
- [ ] Can change idea status
- [ ] Can set RICE scores
- [ ] Can set planning horizon (Now/Next/Later)
- [ ] Can view Matrix page
- [ ] Can view Time Audit page
- [ ] Can view Delivery Board
- [ ] Keyboard shortcuts panel opens with `?`
- [ ] Command palette opens with `Cmd+K`

## Rollback Plan

If issues occur, revert to previous commit:

```bash
git revert HEAD
git push origin main
```

## Version Info

- **Version:** 1.2.0
- **Date:** $(date)
- **Features:**
  - V1.0: Ideas table, detail slider, delivery board, search
  - V1.1: RICE scoring, matrix view, saved/published views, time audit, planning horizon
  - V1.2: Comments, activity log, keyboard shortcuts
