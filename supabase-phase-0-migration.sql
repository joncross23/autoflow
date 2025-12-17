-- ============================================
-- AutoFlow - Phase 0 Database Migration
-- Version: v0.2.0
-- ============================================
-- This migration fixes the kanban board architecture
-- by introducing:
-- 1. columns table - Custom columns per project
-- 2. labels table - Color-coded labels for tasks/ideas/projects
-- 3. tasks table migration - Use column_id instead of fixed status
-- 4. checklists & checklist_items - Rich task management
-- ============================================

-- ============================================
-- 1. COLUMNS TABLE
-- ============================================
-- Each project can have custom columns (like Trello)

CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  color VARCHAR(20), -- e.g., 'blue', 'green', 'orange', 'purple'
  wip_limit INTEGER, -- Work In Progress limit (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, position)
);

-- Enable RLS on columns table
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Users can view columns for their projects
CREATE POLICY "Users can view columns for their projects"
ON columns FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Users can create columns for their projects
CREATE POLICY "Users can create columns for their projects"
ON columns FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Users can update columns for their projects
CREATE POLICY "Users can update columns for their projects"
ON columns FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Users can delete columns for their projects
CREATE POLICY "Users can delete columns for their projects"
ON columns FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = columns.project_id
    AND projects.user_id = auth.uid()
  )
);

-- ============================================
-- 2. LABELS TABLE
-- ============================================
-- Color-coded labels that can be applied to ideas, projects, and tasks

CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL, -- e.g., 'red', 'blue', 'green', 'yellow', 'purple'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS on labels table
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Users can view their own labels
CREATE POLICY "Users can view their own labels"
ON labels FOR SELECT
USING (auth.uid() = user_id);

-- Users can create labels
CREATE POLICY "Users can create labels"
ON labels FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own labels
CREATE POLICY "Users can update their own labels"
ON labels FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own labels
CREATE POLICY "Users can delete their own labels"
ON labels FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. LABEL JUNCTION TABLES
-- ============================================
-- Many-to-many relationships for labels

-- Labels for ideas
CREATE TABLE IF NOT EXISTS idea_labels (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (idea_id, label_id)
);

ALTER TABLE idea_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage labels for their ideas"
ON idea_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = idea_labels.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- Labels for projects
CREATE TABLE IF NOT EXISTS project_labels (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, label_id)
);

ALTER TABLE project_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage labels for their projects"
ON project_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_labels.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Labels for tasks
CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage labels for their tasks"
ON task_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = task_labels.task_id
    AND projects.user_id = auth.uid()
  )
);

-- ============================================
-- 4. CHECKLISTS TABLE
-- ============================================
-- Checklists within tasks (tasks can have multiple checklists)

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checklists for their tasks"
ON checklists FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.id = checklists.task_id
    AND projects.user_id = auth.uid()
  )
);

-- ============================================
-- 5. CHECKLIST ITEMS TABLE
-- ============================================
-- Individual items within a checklist

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checklist items"
ON checklist_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM checklist_items ci
    JOIN checklists c ON ci.checklist_id = c.id
    JOIN tasks t ON c.task_id = t.id
    JOIN projects p ON t.project_id = p.id
    WHERE ci.id = checklist_items.id
    AND p.user_id = auth.uid()
  )
);

-- ============================================
-- 6. MIGRATE TASKS TABLE
-- ============================================
-- Add column_id and keep status temporarily for migration

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES columns(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER;

-- Update existing tasks to have positions
WITH ranked_tasks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) - 1 AS pos
  FROM tasks
  WHERE position IS NULL
)
UPDATE tasks
SET position = ranked_tasks.pos
FROM ranked_tasks
WHERE tasks.id = ranked_tasks.id;

-- ============================================
-- 7. FUNCTION: Create Default Columns for New Projects
-- ============================================
-- When a project is created, automatically create default columns

CREATE OR REPLACE FUNCTION create_default_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO columns (project_id, name, position, color) VALUES
    (NEW.id, 'Backlog', 0, 'slate'),
    (NEW.id, 'To Do', 1, 'blue'),
    (NEW.id, 'In Progress', 2, 'orange'),
    (NEW.id, 'Review', 3, 'purple'),
    (NEW.id, 'Done', 4, 'green');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create columns
DROP TRIGGER IF EXISTS create_default_columns_trigger ON projects;
CREATE TRIGGER create_default_columns_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_columns();

-- ============================================
-- 8. MIGRATION: Map existing tasks to new columns
-- ============================================
-- This script maps existing task statuses to column_id
-- Run this AFTER creating default columns for existing projects

DO $$
DECLARE
  project_record RECORD;
  backlog_col UUID;
  todo_col UUID;
  progress_col UUID;
  review_col UUID;
  done_col UUID;
BEGIN
  -- For each project, create default columns if they don't exist
  FOR project_record IN SELECT id FROM projects LOOP
    -- Check if columns already exist
    IF NOT EXISTS (SELECT 1 FROM columns WHERE project_id = project_record.id) THEN
      -- Create default columns
      INSERT INTO columns (project_id, name, position, color) VALUES
        (project_record.id, 'Backlog', 0, 'slate'),
        (project_record.id, 'To Do', 1, 'blue'),
        (project_record.id, 'In Progress', 2, 'orange'),
        (project_record.id, 'Review', 3, 'purple'),
        (project_record.id, 'Done', 4, 'green');
    END IF;

    -- Get column IDs
    SELECT id INTO backlog_col FROM columns WHERE project_id = project_record.id AND position = 0;
    SELECT id INTO todo_col FROM columns WHERE project_id = project_record.id AND position = 1;
    SELECT id INTO progress_col FROM columns WHERE project_id = project_record.id AND position = 2;
    SELECT id INTO review_col FROM columns WHERE project_id = project_record.id AND position = 3;
    SELECT id INTO done_col FROM columns WHERE project_id = project_record.id AND position = 4;

    -- Migrate tasks based on completed status (since tasks don't have status field yet)
    -- Completed tasks go to "Done", others go to "To Do"
    UPDATE tasks
    SET column_id = CASE
      WHEN completed = TRUE THEN done_col
      ELSE todo_col
    END
    WHERE project_id = project_record.id AND column_id IS NULL;

  END LOOP;
END $$;

-- ============================================
-- 9. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_columns_project_id ON columns(project_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(project_id, position);
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_labels_idea_id ON idea_labels(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_labels_label_id ON idea_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_project_labels_project_id ON project_labels(project_id);
CREATE INDEX IF NOT EXISTS idx_project_labels_label_id ON project_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_label_id ON task_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_checklists_task_id ON checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify migration was successful:

-- Check columns were created
-- SELECT p.name as project, c.name as column, c.position
-- FROM projects p
-- JOIN columns c ON p.id = c.project_id
-- ORDER BY p.name, c.position;

-- Check tasks have column_id
-- SELECT COUNT(*) as total_tasks,
--        COUNT(column_id) as tasks_with_columns
-- FROM tasks;

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('columns', 'labels', 'checklists');

-- ============================================
-- SUCCESS!
-- ============================================
-- Phase 0 database migration complete.
-- Next steps:
-- 1. Update TypeScript types
-- 2. Create API functions for columns/labels/checklists
-- 3. Update UI components
-- ============================================
