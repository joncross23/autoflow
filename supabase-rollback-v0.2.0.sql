-- ============================================
-- AutoFlow - ROLLBACK Script for v0.2.0
-- ============================================
-- Use this to undo the Phase 0 migration
-- WARNING: This will delete all labels, columns, and checklists!
-- ============================================

-- Remove triggers first
DROP TRIGGER IF EXISTS create_default_columns_trigger ON projects;
DROP FUNCTION IF EXISTS create_default_columns();

-- Remove new tables (CASCADE removes foreign keys)
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS project_labels CASCADE;
DROP TABLE IF EXISTS idea_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS columns CASCADE;

-- Remove new columns from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS column_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS description;
ALTER TABLE tasks DROP COLUMN IF EXISTS updated_at;

-- Update positions if needed (tasks table should still work)
-- This is optional - just ensures position values are sequential
WITH ranked_tasks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) - 1 AS new_pos
  FROM tasks
)
UPDATE tasks
SET position = ranked_tasks.new_pos
FROM ranked_tasks
WHERE tasks.id = ranked_tasks.id;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these to confirm rollback worked:

-- Should return 0 (no columns table)
-- SELECT COUNT(*) FROM columns;

-- Should error (table doesn't exist) - that's good!
-- SELECT COUNT(*) FROM labels;

-- Tasks should still exist
-- SELECT COUNT(*) FROM tasks;

-- Projects should still exist
-- SELECT COUNT(*) FROM projects;

-- ============================================
-- SUCCESS!
-- ============================================
-- Rollback complete. Database is back to v0.1.0 state.
-- All ideas, projects, and tasks are preserved.
-- ============================================
