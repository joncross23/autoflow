-- ============================================
-- AutoFlow - Complete RLS Policies Setup
-- ============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vmhvljeydnvcreeaeagc/sql/new
--
-- This script creates all Row Level Security policies for:
-- - ideas
-- - evaluations
-- - projects
-- - tasks
-- ============================================

-- ============================================
-- 1. IDEAS TABLE POLICIES
-- ============================================

-- Enable RLS on ideas table
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can create ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;

-- SELECT: Users can view their own ideas
CREATE POLICY "Users can view their own ideas"
ON ideas FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create ideas
CREATE POLICY "Users can create ideas"
ON ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own ideas
CREATE POLICY "Users can update their own ideas"
ON ideas FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own ideas
CREATE POLICY "Users can delete their own ideas"
ON ideas FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 2. EVALUATIONS TABLE POLICIES
-- ============================================

-- Enable RLS on evaluations table
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view evaluations for their ideas" ON evaluations;
DROP POLICY IF EXISTS "Users can create evaluations for their ideas" ON evaluations;
DROP POLICY IF EXISTS "Users can update evaluations for their ideas" ON evaluations;
DROP POLICY IF EXISTS "Users can delete evaluations for their ideas" ON evaluations;

-- SELECT: Users can view evaluations for their ideas
CREATE POLICY "Users can view evaluations for their ideas"
ON evaluations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = evaluations.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- INSERT: Users can create evaluations for their ideas
CREATE POLICY "Users can create evaluations for their ideas"
ON evaluations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = evaluations.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- UPDATE: Users can update evaluations for their ideas
CREATE POLICY "Users can update evaluations for their ideas"
ON evaluations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = evaluations.idea_id
    AND ideas.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = evaluations.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- DELETE: Users can delete evaluations for their ideas
CREATE POLICY "Users can delete evaluations for their ideas"
ON evaluations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ideas
    WHERE ideas.id = evaluations.idea_id
    AND ideas.user_id = auth.uid()
  )
);

-- ============================================
-- 3. PROJECTS TABLE POLICIES
-- ============================================

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- SELECT: Users can view their own projects
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own projects
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. TASKS TABLE POLICIES
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view tasks for their projects" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks for their projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks for their projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks for their projects" ON tasks;

-- SELECT: Users can view tasks for their projects
CREATE POLICY "Users can view tasks for their projects"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

-- INSERT: Users can create tasks for their projects
CREATE POLICY "Users can create tasks for their projects"
ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

-- UPDATE: Users can update tasks for their projects
CREATE POLICY "Users can update tasks for their projects"
ON tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

-- DELETE: Users can delete tasks for their projects
CREATE POLICY "Users can delete tasks for their projects"
ON tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are created:

-- Check ideas policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'ideas';

-- Check evaluations policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'evaluations';

-- Check projects policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- Check tasks policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'tasks';

-- ============================================
-- SUCCESS!
-- ============================================
-- All RLS policies have been created successfully.
-- Your app should now work with proper security.
-- ============================================
