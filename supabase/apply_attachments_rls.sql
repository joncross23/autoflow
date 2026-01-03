-- Apply Attachments RLS Policies
-- Run this in Supabase SQL Editor if policies are not working

-- First, check current RLS status
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'attachments';

-- Enable RLS on attachments table if not already enabled
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view attachments on their items" ON attachments;
DROP POLICY IF EXISTS "Users can create attachments on their items" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments on their items" ON attachments;

-- View: Check ownership through idea or task->project
CREATE POLICY "Users can view attachments on their items"
ON attachments FOR SELECT
USING (
  uploaded_by = auth.uid()
  OR
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = attachments.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = attachments.task_id AND p.user_id = auth.uid()
  ))
);

-- Insert: Just check uploaded_by (API verifies ownership before insert)
CREATE POLICY "Users can create attachments on their items"
ON attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
);

-- Delete: Check ownership through uploaded_by or item ownership
CREATE POLICY "Users can delete attachments on their items"
ON attachments FOR DELETE
USING (
  uploaded_by = auth.uid()
  OR
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = attachments.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = attachments.task_id AND p.user_id = auth.uid()
  ))
);

-- Verify policies were created
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'attachments'
ORDER BY policyname;
