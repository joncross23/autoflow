# Migration Safety Guide - No Backups Available

**⚠️ CRITICAL**: You're on a Free Plan without automatic backups. Follow these steps carefully.

---

## Step 1: Create Manual Backup (5 minutes)

### Run the export script:

```bash
cd /Users/jonx/autoflow
npx ts-node scripts/export-data.ts
```

This creates a `backup-YYYY-MM-DD/` folder with JSON files containing all your data.

**Verify the backup:**
```bash
ls -la backup-*/
# Should show: ideas.json, projects.json, tasks.json, evaluations.json
```

---

## Step 2: Test Migration on a Fresh Database (Recommended)

### Option A: Create a test Supabase project
1. Go to [Supabase](https://supabase.com/dashboard)
2. Create a new free project (test-autoflow)
3. Run the original schema setup
4. Add some test data
5. Run the migration
6. Verify it works

### Option B: Skip testing (riskier, but acceptable if you trust the backup)
- Proceed directly to Step 3

---

## Step 3: Review What Will Change

### Tables Being ADDED (safe - no data loss):
- ✅ `columns` - New table
- ✅ `labels` - New table
- ✅ `idea_labels` - New table
- ✅ `project_labels` - New table
- ✅ `task_labels` - New table
- ✅ `checklists` - New table
- ✅ `checklist_items` - New table

### Tables Being MODIFIED (check carefully):
- ⚠️ `tasks` table:
  - ADD `column_id` (nullable - safe)
  - ADD `description` (nullable - safe)
  - ADD `updated_at` (with default - safe)
  - ADD `position` (filled automatically - safe)
  - Existing data: **PRESERVED**

### What Happens to Existing Data:
| Table | Action | Risk Level |
|-------|--------|-----------|
| `ideas` | No changes | ✅ Zero risk |
| `projects` | No changes to existing data | ✅ Zero risk |
| `tasks` | Adds new columns, populates them | 🟡 Low risk |
| `evaluations` | No changes | ✅ Zero risk |

---

## Step 4: Run Migration (Incremental Approach)

Instead of running the full migration at once, let's break it into 3 safe steps:

### Part 1: Create new tables ONLY (safest first step)

```sql
-- Just creates new tables, doesn't touch existing data
-- Copy lines 1-235 from supabase-phase-0-migration.sql
-- (Everything up to "6. MIGRATE TASKS TABLE")
```

**Verify Part 1:**
```sql
-- Check new tables exist
SELECT tablename FROM pg_tables WHERE tablename IN ('columns', 'labels', 'checklists');
-- Should return 3 rows

-- Check old tables untouched
SELECT COUNT(*) FROM tasks;
-- Should show your current task count
```

### Part 2: Modify tasks table

```sql
-- Add new columns to tasks (doesn't delete anything)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES columns(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER;
```

**Verify Part 2:**
```sql
-- Check columns were added
SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks';
-- Should show: id, project_id, title, completed, created_at, column_id, description, updated_at, position
```

### Part 3: Create default columns and map tasks

```sql
-- Run sections 7 and 8 from supabase-phase-0-migration.sql
-- This creates default columns and assigns tasks to them
```

**Verify Part 3:**
```sql
-- Check columns created for each project
SELECT p.title, COUNT(c.id) as column_count
FROM projects p
LEFT JOIN columns c ON p.id = c.project_id
GROUP BY p.id, p.title;
-- Each project should have 5 columns

-- Check tasks assigned to columns
SELECT COUNT(*) as total_tasks, COUNT(column_id) as assigned_tasks
FROM tasks;
-- Both numbers should match
```

---

## Step 5: Verify Everything Works

### Database Checks:
```sql
-- 1. All projects have columns
SELECT id, title FROM projects WHERE id NOT IN (
  SELECT DISTINCT project_id FROM columns
);
-- Should return 0 rows

-- 2. All tasks have column_id
SELECT COUNT(*) FROM tasks WHERE column_id IS NULL;
-- Should return 0

-- 3. RLS policies exist
SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('columns', 'labels', 'checklists');
-- Should return 12+ policies
```

### App Test:
```bash
npm run dev
```

1. ✅ Login works
2. ✅ Can see existing ideas
3. ✅ Can see existing projects
4. ✅ Can create a new project → should auto-create 5 columns
5. ✅ Existing tasks still visible

---

## Step 6: Rollback (If Needed)

If something goes wrong:

### Quick Rollback:
```bash
# Open Supabase SQL Editor
# Copy contents of supabase-rollback-v0.2.0.sql
# Paste and run
```

### Manual Data Restore (if rollback fails):
```sql
-- Delete all data
TRUNCATE ideas, projects, tasks, evaluations CASCADE;

-- Use Supabase SQL Editor to insert from backup files
-- Example:
INSERT INTO ideas (id, user_id, title, ...) VALUES
  -- Copy-paste from backup-*/ideas.json
```

---

## Migration Decision Tree

```
Do you have test data only?
├─ YES → Run full migration now (low risk)
└─ NO → Do you have production data?
    ├─ YES → Follow incremental approach (Parts 1-3)
    └─ UNSURE → Export backup first, then decide
```

---

## What I Recommend

Given no automatic backups:

1. **✅ Run the export script** (takes 30 seconds)
2. **✅ Review what will change** (read Step 3 above)
3. **✅ Use incremental approach** (run Parts 1-3 separately)
4. **✅ Test after each part** (verify queries)
5. **✅ Keep rollback script ready** (just in case)

**Total time**: 10-15 minutes (being cautious)

---

## How Safe Is This Migration?

### Risk Assessment:

| Aspect | Risk Level | Why |
|--------|-----------|-----|
| Data loss | 🟢 Very Low | Only adding tables/columns, not deleting |
| Breaking changes | 🟡 Medium | App needs updates to use new structure |
| Reversibility | 🟢 Easy | Rollback script provided |
| Performance impact | 🟢 Minimal | Indexes added for efficiency |

### What Could Go Wrong:

1. **Trigger fails to create** → Manually create columns for new projects (easy fix)
2. **RLS policies not applied** → Users might see wrong data (run policies again)
3. **Position numbering wrong** → Tasks in wrong order (cosmetic, easy fix)
4. **App breaks** → Old code references old structure (expected, UI updates pending)

**None of these scenarios cause data loss.**

---

## Final Checklist Before Running

- [ ] Exported backup (`backup-YYYY-MM-DD/` folder exists)
- [ ] Reviewed what changes (understand tables/columns being added)
- [ ] Have rollback script ready (supabase-rollback-v0.2.0.sql)
- [ ] Supabase SQL Editor open
- [ ] Ready to test app after migration

---

## Questions? Concerns?

Let me know if you want to:
- Walk through the migration line-by-line
- Test on a smaller subset first
- See specific SQL commands before running
- Get more safety measures

**Your data safety is the priority.**
