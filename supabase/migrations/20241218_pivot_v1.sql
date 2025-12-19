-- AutoFlow Pivot Migration V1.0
-- Merges Projects into Ideas, global columns, tasks reference ideas
-- Run with: supabase db push

-- ============================================
-- STEP 1: Create new status enum for ideas
-- ============================================

-- Create new status type (old: new, evaluating, prioritised, converting, archived)
-- New: new, evaluating, accepted, doing, complete, parked, dropped
CREATE TYPE idea_status_v2 AS ENUM (
  'new',
  'evaluating',
  'accepted',
  'doing',
  'complete',
  'parked',
  'dropped'
);

-- Create effort estimate type
CREATE TYPE effort_estimate AS ENUM (
  'trivial',     -- < 1 hour
  'small',       -- 1-4 hours
  'medium',      -- 1-2 days
  'large',       -- 3-5 days
  'xlarge'       -- 1+ weeks
);

-- ============================================
-- STEP 2: Add new columns to ideas table
-- ============================================

-- Add new fields to ideas table
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS status_v2 idea_status_v2 DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS effort_estimate effort_estimate,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS team_id uuid,  -- No FK yet, future-ready
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Migrate existing status values to new enum
UPDATE ideas SET status_v2 =
  CASE status
    WHEN 'new' THEN 'new'::idea_status_v2
    WHEN 'evaluating' THEN 'evaluating'::idea_status_v2
    WHEN 'prioritised' THEN 'accepted'::idea_status_v2
    WHEN 'converting' THEN 'doing'::idea_status_v2
    WHEN 'archived' THEN 'parked'::idea_status_v2
    ELSE 'new'::idea_status_v2
  END;

-- ============================================
-- STEP 3: Migrate projects to ideas
-- ============================================

-- Insert projects as ideas with status 'accepted'
INSERT INTO ideas (
  id,
  user_id,
  title,
  description,
  status_v2,
  priority,
  position,
  started_at,
  created_at,
  updated_at
)
SELECT
  p.id,
  p.user_id,
  p.title,
  p.description,
  CASE p.status
    WHEN 'backlog' THEN 'accepted'::idea_status_v2
    WHEN 'planning' THEN 'accepted'::idea_status_v2
    WHEN 'in_progress' THEN 'doing'::idea_status_v2
    WHEN 'review' THEN 'doing'::idea_status_v2
    WHEN 'done' THEN 'complete'::idea_status_v2
    WHEN 'archived' THEN 'parked'::idea_status_v2
    ELSE 'accepted'::idea_status_v2
  END,
  p.priority,
  p.position,
  CASE WHEN p.status IN ('in_progress', 'review', 'done') THEN p.created_at ELSE NULL END,
  p.created_at,
  p.updated_at
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM ideas i WHERE i.id = p.id
);

-- Migrate project labels to idea labels
INSERT INTO idea_labels (idea_id, label_id, created_at)
SELECT project_id, label_id, created_at
FROM project_labels
WHERE NOT EXISTS (
  SELECT 1 FROM idea_labels il
  WHERE il.idea_id = project_labels.project_id
    AND il.label_id = project_labels.label_id
);

-- ============================================
-- STEP 4: Update tasks to reference ideas
-- ============================================

-- Add idea_id column to tasks (nullable for orphan tasks)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS idea_id uuid REFERENCES ideas(id) ON DELETE SET NULL;

-- Migrate project_id to idea_id
UPDATE tasks SET idea_id = project_id WHERE idea_id IS NULL;

-- ============================================
-- STEP 5: Make columns global (user-scoped, not project-scoped)
-- ============================================

-- Add user_id to columns table
ALTER TABLE columns
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Set user_id from the project's user_id
UPDATE columns c
SET user_id = p.user_id
FROM projects p
WHERE c.project_id = p.id AND c.user_id IS NULL;

-- ============================================
-- STEP 6: Create themes table (multi-select categories)
-- ============================================

CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idea_themes (
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (idea_id, theme_id)
);

-- ============================================
-- STEP 7: Create default columns for existing users
-- ============================================

-- Insert default columns for users who don't have any global columns
INSERT INTO columns (user_id, name, position, color)
SELECT DISTINCT u.id, col.name, col.position, col.color
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Backlog', 0, 'slate'),
    ('To Do', 1, 'blue'),
    ('In Progress', 2, 'yellow'),
    ('Review', 3, 'purple'),
    ('Done', 4, 'green')
) AS col(name, position, color)
WHERE NOT EXISTS (
  SELECT 1 FROM columns c
  WHERE c.user_id = u.id AND c.project_id IS NULL
);

-- ============================================
-- STEP 8: Update RLS policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_themes ENABLE ROW LEVEL SECURITY;

-- Themes RLS policies
CREATE POLICY "Users can view their own themes"
  ON themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create themes"
  ON themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON themes FOR DELETE
  USING (auth.uid() = user_id);

-- Idea themes RLS policies
CREATE POLICY "Users can view idea themes for their ideas"
  ON idea_themes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_themes.idea_id AND ideas.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage idea themes for their ideas"
  ON idea_themes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_themes.idea_id AND ideas.user_id = auth.uid()
  ));

-- Update columns RLS to include user_id scope
DROP POLICY IF EXISTS "Users can view columns for their projects" ON columns;
CREATE POLICY "Users can view their columns"
  ON columns FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM projects WHERE projects.id = columns.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage columns for their projects" ON columns;
CREATE POLICY "Users can manage their columns"
  ON columns FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM projects WHERE projects.id = columns.project_id AND projects.user_id = auth.uid())
  );

-- Update tasks RLS to include idea_id scope
DROP POLICY IF EXISTS "Users can view tasks for their projects" ON tasks;
CREATE POLICY "Users can view their tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM ideas WHERE ideas.id = tasks.idea_id AND ideas.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage tasks for their projects" ON tasks;
CREATE POLICY "Users can manage their tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM ideas WHERE ideas.id = tasks.idea_id AND ideas.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.user_id = auth.uid())
  );

-- ============================================
-- STEP 9: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON ideas(user_id, status_v2);
CREATE INDEX IF NOT EXISTS idx_ideas_archived ON ideas(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_tasks_idea ON tasks(idea_id);
CREATE INDEX IF NOT EXISTS idx_columns_user ON columns(user_id);
CREATE INDEX IF NOT EXISTS idx_themes_user ON themes(user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN ideas.status_v2 IS 'Unified status: new → evaluating → accepted → doing → complete | parked | dropped';
COMMENT ON COLUMN ideas.team_id IS 'Future: team-based access control';
COMMENT ON COLUMN ideas.archived IS 'Soft archive, separate from status';
COMMENT ON COLUMN tasks.idea_id IS 'Link to parent idea (nullable for orphan tasks)';
COMMENT ON COLUMN columns.user_id IS 'Global columns are user-scoped, not project-scoped';
