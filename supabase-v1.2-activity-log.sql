-- ============================================
-- AutoFlow - V1.2 Activity Log Migration
-- Version: 1.2.1
-- ============================================
-- This migration adds activity logging for ideas
-- ============================================

-- ============================================
-- 1. ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Target entity (polymorphic)
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Activity details
  action VARCHAR(50) NOT NULL,  -- created, updated, status_changed, commented, etc.
  field_name VARCHAR(100),       -- Which field was changed (for updates)
  old_value TEXT,                -- Previous value (for updates)
  new_value TEXT,                -- New value (for updates)
  metadata JSONB DEFAULT '{}',   -- Additional context

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure log belongs to either idea or task
  CONSTRAINT activity_log_target_check CHECK (
    (idea_id IS NOT NULL AND task_id IS NULL) OR
    (idea_id IS NULL AND task_id IS NOT NULL) OR
    (idea_id IS NULL AND task_id IS NULL)  -- Allow system-level logs
  )
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activity_log_idea_id ON activity_log(idea_id) WHERE idea_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_task_id ON activity_log(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view activity on their own ideas/tasks
CREATE POLICY "Users can view their activity logs"
ON activity_log FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = activity_log.idea_id AND ideas.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = activity_log.task_id AND i.user_id = auth.uid()
  )
);

-- Users can create activity logs for their own actions
CREATE POLICY "Users can create activity logs"
ON activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Activity logs are immutable (no update/delete)

-- ============================================
-- 4. TRIGGER FUNCTION FOR AUTOMATIC LOGGING
-- ============================================

-- Function to log idea changes automatically
CREATE OR REPLACE FUNCTION log_idea_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, idea_id, action, metadata)
    VALUES (NEW.user_id, NEW.id, 'created', jsonb_build_object('title', NEW.title));
    RETURN NEW;
  END IF;

  -- Log updates
  IF TG_OP = 'UPDATE' THEN
    -- Status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id, 'status_changed', 'status', OLD.status, NEW.status);
    END IF;

    -- Title change
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id, 'updated', 'title', OLD.title, NEW.title);
    END IF;

    -- Description change
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id, 'updated', 'description',
        CASE WHEN OLD.description IS NOT NULL THEN 'Updated' ELSE NULL END,
        CASE WHEN NEW.description IS NOT NULL THEN 'Updated' ELSE NULL END);
    END IF;

    -- Horizon change
    IF OLD.horizon IS DISTINCT FROM NEW.horizon THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id, 'updated', 'horizon', OLD.horizon, NEW.horizon);
    END IF;

    -- Effort change
    IF OLD.effort_estimate IS DISTINCT FROM NEW.effort_estimate THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id, 'updated', 'effort_estimate', OLD.effort_estimate, NEW.effort_estimate);
    END IF;

    -- Archive change
    IF OLD.archived IS DISTINCT FROM NEW.archived THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value)
      VALUES (NEW.user_id, NEW.id,
        CASE WHEN NEW.archived THEN 'archived' ELSE 'unarchived' END,
        'archived', OLD.archived::TEXT, NEW.archived::TEXT);
    END IF;

    -- RICE score change
    IF OLD.rice_score IS DISTINCT FROM NEW.rice_score THEN
      INSERT INTO activity_log (user_id, idea_id, action, field_name, old_value, new_value, metadata)
      VALUES (NEW.user_id, NEW.id, 'updated', 'rice_score',
        OLD.rice_score::TEXT, NEW.rice_score::TEXT,
        jsonb_build_object(
          'reach', NEW.rice_reach,
          'impact', NEW.rice_impact,
          'confidence', NEW.rice_confidence,
          'effort', NEW.rice_effort
        ));
    END IF;

    RETURN NEW;
  END IF;

  -- Log deletion
  IF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (user_id, idea_id, action, metadata)
    VALUES (OLD.user_id, NULL, 'deleted', jsonb_build_object('title', OLD.title, 'deleted_id', OLD.id));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_log_idea_changes ON ideas;

-- Create trigger for idea changes
CREATE TRIGGER trigger_log_idea_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION log_idea_changes();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get recent activity for a user
CREATE OR REPLACE FUNCTION get_recent_activity(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action VARCHAR(50),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  idea_id UUID,
  idea_title TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.field_name,
    al.old_value,
    al.new_value,
    al.idea_id,
    i.title as idea_title,
    al.created_at
  FROM activity_log al
  LEFT JOIN ideas i ON i.id = al.idea_id
  WHERE al.user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_log';
-- SELECT * FROM activity_log LIMIT 5;

-- ============================================
-- SUCCESS!
-- ============================================
-- V1.2 Activity Log table created.
-- Features:
-- - Automatic logging via database trigger
-- - Tracks status changes, field updates, creation/deletion
-- - RLS policies for secure access
-- - Immutable logs (no update/delete allowed)
-- ============================================
