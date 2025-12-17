# Migration Guide: v0.1.0 → v0.2.0

## Overview

This migration introduces **critical architectural changes** to fix the kanban board structure. The changes are **breaking** but essential for the app to function correctly according to the intended design.

### What's Changed

1. **Kanban Board Architecture Fix**:
   - Projects are no longer displayed as cards on a kanban
   - Each project now HAS a kanban board containing tasks
   - Tasks are assigned to custom columns (not fixed statuses)

2. **New Tables**:
   - `columns` - Custom columns per project
   - `labels` - Color-coded labels for tasks/ideas/projects
   - `idea_labels`, `project_labels`, `task_labels` - Label associations
   - `checklists` - Checklists within tasks
   - `checklist_items` - Individual checklist items

3. **Modified Tables**:
   - `tasks` - Now has `column_id`, `description`, and `updated_at`

---

## Migration Steps

### Step 1: Backup Your Data

**IMPORTANT**: Before running any migration, backup your current database!

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vmhvljeydnvcreeaeagc)
2. Navigate to Database → Backups
3. Create a manual backup

### Step 2: Run the Migration SQL

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/vmhvljeydnvcreeaeagc/sql/new)

2. Copy the entire contents of `supabase-phase-0-migration.sql`

3. Paste into the SQL editor

4. Click **Run** (or press Cmd/Ctrl + Enter)

5. Wait for confirmation message

### Step 3: Verify Migration

Run these verification queries in the SQL Editor:

```sql
-- Check columns were created
SELECT p.name as project, c.name as column, c.position
FROM projects p
JOIN columns c ON p.id = c.project_id
ORDER BY p.name, c.position;

-- Check tasks have column_id
SELECT COUNT(*) as total_tasks,
       COUNT(column_id) as tasks_with_columns
FROM tasks;

-- Check RLS policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('columns', 'labels', 'checklists', 'idea_labels', 'project_labels', 'task_labels')
ORDER BY tablename, policyname;

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('columns', 'labels', 'checklists', 'checklist_items')
ORDER BY tablename, indexname;
```

### Step 4: Test the Application

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Test project creation**:
   - Create a new project
   - Verify 5 default columns are created (Backlog, To Do, In Progress, Review, Done)

3. **Test existing projects**:
   - Open an existing project
   - Verify existing tasks appear in the "To Do" or "Done" column
   - Verify you can drag tasks between columns

4. **Test labels** (once UI is ready):
   - Create a label
   - Assign it to an idea/project/task
   - Verify it appears correctly

---

## What Happens to Existing Data?

### Projects
- ✅ **No data loss** - All projects remain intact
- ✅ **Default columns created** - Each project gets 5 default columns automatically
- ⚠️ **Status field remains** - Not used anymore but kept for reference

### Tasks
- ✅ **No data loss** - All tasks remain intact
- ✅ **Auto-assigned to columns**:
  - Completed tasks → "Done" column
  - Incomplete tasks → "To Do" column
- ⚠️ **Completed field remains** - Still functional for backward compatibility

### Ideas
- ✅ **No changes** - Ideas are unaffected by this migration

---

## Rollback Plan

If something goes wrong, you can rollback:

1. Restore from the backup created in Step 1

2. OR run this rollback SQL:

```sql
-- Remove new tables
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS project_labels CASCADE;
DROP TABLE IF EXISTS idea_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS columns CASCADE;

-- Remove new columns from tasks
ALTER TABLE tasks DROP COLUMN IF EXISTS column_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS description;

-- Remove trigger
DROP TRIGGER IF EXISTS create_default_columns_trigger ON projects;
DROP FUNCTION IF EXISTS create_default_columns();
```

⚠️ **WARNING**: Rollback will delete all labels, columns, and checklists created after migration!

---

## Breaking Changes

### API Changes

#### Tasks API

**Before (v0.1.0)**:
```typescript
interface DbTask {
  id: string;
  project_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}
```

**After (v0.2.0)**:
```typescript
interface DbTask {
  id: string;
  project_id: string;
  column_id: string | null;  // NEW
  title: string;
  description: string | null; // NEW
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;         // NEW
}
```

### UI Changes

1. **Projects Page**:
   - **Before**: Kanban board showing projects as cards
   - **After**: Card/table view showing list of projects

2. **Project Detail Page** (NEW):
   - **Route**: `/dashboard/projects/[id]`
   - **Content**: Kanban board of tasks within the project

3. **Navigation**:
   - Click a project card → Opens project board
   - Breadcrumbs show current location

---

## New Features Available After Migration

### 1. Custom Columns
- Each project can have its own column structure
- Reorder columns by dragging
- Set WIP limits per column
- Color-code columns

### 2. Labels
- Create color-coded labels
- Apply to ideas, projects, and tasks
- Filter by labels
- Organize work visually

### 3. Checklists
- Add multiple checklists to tasks
- Track progress with completion percentage
- Multi-line paste to add multiple items at once
- Rich task management

---

## Next Steps After Migration

1. ✅ Migration complete
2. Run `npm run dev` to start development
3. Test creating new projects
4. Test moving tasks between columns
5. Proceed with Phase 0 UI implementation:
   - Project detail page with kanban
   - Card/table view toggle
   - Label management UI
   - Checklist UI

---

## Troubleshooting

### Error: "relation columns does not exist"
**Solution**: Run the migration SQL again

### Error: "permission denied for table columns"
**Solution**: Check RLS policies were created:
```sql
SELECT * FROM pg_policies WHERE tablename = 'columns';
```

### Tasks not appearing in columns
**Solution**: Run the migration script in section 8 again to map tasks to columns

### Can't create new projects
**Solution**: Check the trigger was created:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'create_default_columns_trigger';
```

---

## Support

If you encounter issues during migration:

1. Check the verification queries above
2. Review error messages in Supabase logs
3. Restore from backup if needed
4. Reach out for help with specific error messages

---

## Summary

**Total Tables Added**: 7
- `columns`
- `labels`
- `idea_labels`
- `project_labels`
- `task_labels`
- `checklists`
- `checklist_items`

**Total Tables Modified**: 1
- `tasks` (added `column_id`, `description`, `updated_at`)

**Data at Risk**: None (all existing data preserved)

**Estimated Migration Time**: 2-5 minutes

**Rollback Available**: Yes (with data loss for new features)

---

**Ready to migrate?** Follow Step 1 above to begin!
