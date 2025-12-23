-- Fix RLS policies for task_labels table
-- The task_labels table needs policies that allow users to manage labels
-- for tasks they own (via ideas or orphan tasks via columns)

-- Enable RLS on task_labels if not already enabled
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view task labels" ON task_labels;
DROP POLICY IF EXISTS "Users can manage task labels" ON task_labels;
DROP POLICY IF EXISTS "Users can insert task labels" ON task_labels;
DROP POLICY IF EXISTS "Users can delete task labels" ON task_labels;

-- Policy: Users can view labels for tasks they can access
CREATE POLICY "Users can view task labels"
  ON task_labels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_labels.task_id
      AND (
        -- Task linked to an idea the user owns
        EXISTS (SELECT 1 FROM ideas WHERE ideas.id = t.idea_id AND ideas.user_id = auth.uid())
        OR
        -- Task in a column the user owns (orphan tasks)
        EXISTS (SELECT 1 FROM columns WHERE columns.id = t.column_id AND columns.user_id = auth.uid())
        OR
        -- Legacy: task in a project the user owns
        EXISTS (SELECT 1 FROM projects WHERE projects.id = t.project_id AND projects.user_id = auth.uid())
      )
    )
  );

-- Policy: Users can add labels to tasks they can access
CREATE POLICY "Users can insert task labels"
  ON task_labels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_labels.task_id
      AND (
        -- Task linked to an idea the user owns
        EXISTS (SELECT 1 FROM ideas WHERE ideas.id = t.idea_id AND ideas.user_id = auth.uid())
        OR
        -- Task in a column the user owns (orphan tasks)
        EXISTS (SELECT 1 FROM columns WHERE columns.id = t.column_id AND columns.user_id = auth.uid())
        OR
        -- Legacy: task in a project the user owns
        EXISTS (SELECT 1 FROM projects WHERE projects.id = t.project_id AND projects.user_id = auth.uid())
      )
    )
  );

-- Policy: Users can remove labels from tasks they can access
CREATE POLICY "Users can delete task labels"
  ON task_labels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_labels.task_id
      AND (
        -- Task linked to an idea the user owns
        EXISTS (SELECT 1 FROM ideas WHERE ideas.id = t.idea_id AND ideas.user_id = auth.uid())
        OR
        -- Task in a column the user owns (orphan tasks)
        EXISTS (SELECT 1 FROM columns WHERE columns.id = t.column_id AND columns.user_id = auth.uid())
        OR
        -- Legacy: task in a project the user owns
        EXISTS (SELECT 1 FROM projects WHERE projects.id = t.project_id AND projects.user_id = auth.uid())
      )
    )
  );
