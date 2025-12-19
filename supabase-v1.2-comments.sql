-- ============================================
-- AutoFlow - V1.2 Comments System Migration
-- Version: 1.2.0
-- ============================================
-- This migration adds threaded comments to ideas and tasks
-- ============================================

-- ============================================
-- 1. COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic association: either idea_id or task_id
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Thread support (reply to another comment)
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure comment belongs to either idea or task (not both, not neither)
  CONSTRAINT comments_target_check CHECK (
    (idea_id IS NOT NULL AND task_id IS NULL) OR
    (idea_id IS NULL AND task_id IS NOT NULL)
  )
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id) WHERE idea_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on their own ideas/tasks
CREATE POLICY "Users can view comments on their ideas"
ON comments FOR SELECT
USING (
  comments.user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = comments.idea_id AND ideas.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = comments.task_id AND i.user_id = auth.uid()
  )
);

-- Users can create comments on their own ideas/tasks
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    (idea_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM ideas WHERE ideas.id = idea_id AND ideas.user_id = auth.uid()
    ))
    OR
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN ideas i ON t.idea_id = i.id
      WHERE t.id = task_id AND i.user_id = auth.uid()
    ))
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_updated_at ON comments;

CREATE TRIGGER trigger_update_comment_updated_at
  BEFORE UPDATE OF content
  ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();

-- ============================================
-- 5. COMMENT COUNT VIEW (for quick access)
-- ============================================

-- Function to get comment count for an idea
CREATE OR REPLACE FUNCTION get_idea_comment_count(p_idea_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE idea_id = p_idea_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get comment count for a task
CREATE OR REPLACE FUNCTION get_task_comment_count(p_task_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE task_id = p_task_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'comments';
-- SELECT * FROM comments LIMIT 1;

-- ============================================
-- SUCCESS!
-- ============================================
-- V1.2 Comments table created.
-- Features:
-- - Polymorphic association (idea_id OR task_id)
-- - Threaded replies via parent_id
-- - Edit tracking (is_edited, updated_at)
-- - RLS policies for secure access
-- ============================================
