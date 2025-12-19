-- ============================================
-- AutoFlow - V1.0 Pivot Migration
-- Version: 1.0.0
-- ============================================
-- This migration implements the "Table-First" pivot:
-- 1. Extended ideas table with new fields
-- 2. Global columns (user-scoped, not project-scoped)
-- 3. Tasks reference ideas directly (idea_id)
-- 4. Themes table for multi-select categories
-- ============================================

-- ============================================
-- 0. UPDATE IDEA_STATUS ENUM
-- ============================================
-- Add new status values to the enum

DO $$
BEGIN
  -- Add 'accepted' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'accepted' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'idea_status')) THEN
    ALTER TYPE idea_status ADD VALUE 'accepted';
  END IF;
END $$;

DO $$
BEGIN
  -- Add 'doing' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'doing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'idea_status')) THEN
    ALTER TYPE idea_status ADD VALUE 'doing';
  END IF;
END $$;

DO $$
BEGIN
  -- Add 'complete' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'complete' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'idea_status')) THEN
    ALTER TYPE idea_status ADD VALUE 'complete';
  END IF;
END $$;

DO $$
BEGIN
  -- Add 'parked' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'parked' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'idea_status')) THEN
    ALTER TYPE idea_status ADD VALUE 'parked';
  END IF;
END $$;

DO $$
BEGIN
  -- Add 'dropped' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'dropped' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'idea_status')) THEN
    ALTER TYPE idea_status ADD VALUE 'dropped';
  END IF;
END $$;

-- ============================================
-- 1. EXTEND IDEAS TABLE
-- ============================================

-- Add new status values and fields to ideas
DO $$
BEGIN
  -- Add effort_estimate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'effort_estimate') THEN
    ALTER TABLE ideas ADD COLUMN effort_estimate VARCHAR(20);
  END IF;

  -- Add owner field (text for now, can be FK to users later)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'owner') THEN
    ALTER TABLE ideas ADD COLUMN owner VARCHAR(100);
  END IF;

  -- Add team_id for future team support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'team_id') THEN
    ALTER TABLE ideas ADD COLUMN team_id UUID;
  END IF;

  -- Add archived flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'archived') THEN
    ALTER TABLE ideas ADD COLUMN archived BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add started_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'started_at') THEN
    ALTER TABLE ideas ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add completed_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'completed_at') THEN
    ALTER TABLE ideas ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add index for archived filter
CREATE INDEX IF NOT EXISTS idx_ideas_archived ON ideas(archived);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);

-- ============================================
-- 2. UPDATE COLUMNS TABLE FOR GLOBAL USE
-- ============================================

-- Add user_id column if it doesn't exist (for global columns)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'columns' AND column_name = 'user_id') THEN
    ALTER TABLE columns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make project_id nullable (global columns don't need a project)
ALTER TABLE columns ALTER COLUMN project_id DROP NOT NULL;

-- Drop the unique constraint on project_id, position if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'columns_project_id_position_key') THEN
    ALTER TABLE columns DROP CONSTRAINT columns_project_id_position_key;
  END IF;
END $$;

-- Create index for user columns
CREATE INDEX IF NOT EXISTS idx_columns_user_id ON columns(user_id);

-- Update RLS policies for global columns
DROP POLICY IF EXISTS "Users can view columns for their projects" ON columns;
DROP POLICY IF EXISTS "Users can create columns for their projects" ON columns;
DROP POLICY IF EXISTS "Users can update columns for their projects" ON columns;
DROP POLICY IF EXISTS "Users can delete columns for their projects" ON columns;

-- New policies that support both project-based and user-based columns
CREATE POLICY "Users can view their columns"
ON columns FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their columns"
ON columns FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their columns"
ON columns FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their columns"
ON columns FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

-- ============================================
-- 3. UPDATE TASKS TABLE
-- ============================================

-- Add idea_id column to tasks (for linking tasks directly to ideas)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'tasks' AND column_name = 'idea_id') THEN
    ALTER TABLE tasks ADD COLUMN idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make project_id nullable (tasks can be orphans or linked to ideas)
ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;

-- Create index for idea_id
CREATE INDEX IF NOT EXISTS idx_tasks_idea_id ON tasks(idea_id);

-- Update task RLS policies to allow orphan tasks
DROP POLICY IF EXISTS "Users can manage their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their tasks" ON tasks;

-- Tasks can be accessed if user owns the project, the idea, or it's an orphan task with their column
CREATE POLICY "Users can view their tasks"
ON tasks FOR SELECT
USING (
  -- Task belongs to user's project
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
  OR
  -- Task belongs to user's idea
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = tasks.idea_id
    AND ideas.user_id = auth.uid()
  )
  OR
  -- Orphan task in user's column
  (tasks.project_id IS NULL AND tasks.idea_id IS NULL AND EXISTS (
    SELECT 1 FROM columns
    WHERE columns.id = tasks.column_id
    AND columns.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their tasks"
ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = tasks.idea_id
    AND ideas.user_id = auth.uid()
  )
  OR
  (tasks.project_id IS NULL AND tasks.idea_id IS NULL AND EXISTS (
    SELECT 1 FROM columns
    WHERE columns.id = tasks.column_id
    AND columns.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their tasks"
ON tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = tasks.idea_id
    AND ideas.user_id = auth.uid()
  )
  OR
  (tasks.project_id IS NULL AND tasks.idea_id IS NULL AND EXISTS (
    SELECT 1 FROM columns
    WHERE columns.id = tasks.column_id
    AND columns.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can delete their tasks"
ON tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = tasks.idea_id
    AND ideas.user_id = auth.uid()
  )
  OR
  (tasks.project_id IS NULL AND tasks.idea_id IS NULL AND EXISTS (
    SELECT 1 FROM columns
    WHERE columns.id = tasks.column_id
    AND columns.user_id = auth.uid()
  ))
);

-- ============================================
-- 4. THEMES TABLE (Multi-select categories)
-- ============================================

CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their themes"
ON themes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create themes"
ON themes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their themes"
ON themes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their themes"
ON themes FOR DELETE
USING (auth.uid() = user_id);

-- Junction table for idea themes
CREATE TABLE IF NOT EXISTS idea_themes (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (idea_id, theme_id)
);

ALTER TABLE idea_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage themes for their ideas"
ON idea_themes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = idea_themes.idea_id
    AND ideas.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_themes_user_id ON themes(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_themes_idea_id ON idea_themes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_themes_theme_id ON idea_themes(theme_id);

-- ============================================
-- 5. UPDATE CHECKLISTS TO SUPPORT IDEAS
-- ============================================

-- Add idea_id to checklists (checklists can be on ideas too)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'checklists' AND column_name = 'idea_id') THEN
    ALTER TABLE checklists ADD COLUMN idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make task_id nullable (checklists can be on ideas instead)
ALTER TABLE checklists ALTER COLUMN task_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_checklists_idea_id ON checklists(idea_id);

-- Update checklist RLS to support idea checklists
DROP POLICY IF EXISTS "Users can manage checklists for their tasks" ON checklists;

CREATE POLICY "Users can manage checklists"
ON checklists FOR ALL
USING (
  -- Checklist on task
  EXISTS (
    SELECT 1 FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = checklists.task_id
    AND projects.user_id = auth.uid()
  )
  OR
  -- Checklist on idea
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = checklists.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify migration was successful:

-- Check ideas table has new columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'ideas';

-- Check columns table has user_id
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'columns';

-- Check tasks table has idea_id
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'tasks';

-- ============================================
-- SUCCESS!
-- ============================================
-- V1.0 Pivot migration complete.
-- The database now supports:
-- - Extended ideas with status workflow
-- - Global columns (user-scoped)
-- - Tasks linked to ideas
-- - Themes for categorization
-- ============================================
