-- ============================================
-- AutoFlow - V1.3 Rich Cards Migration
-- Version: 1.3.0
-- ============================================
-- This migration adds Labels, Attachments, Links, and Priority
-- ============================================

-- ============================================
-- 1. LABELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,  -- Hex colour e.g. '#3B82F6'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- ============================================
-- 2. IDEA-LABEL JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS idea_labels (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (idea_id, label_id)
);

-- ============================================
-- 3. TASK-LABEL JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

-- ============================================
-- 4. ATTACHMENTS TABLE (POLYMORPHIC)
-- ============================================

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic association: either idea_id or task_id
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- File details
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,        -- Supabase Storage path
  file_type TEXT,                 -- MIME type
  file_size INTEGER,              -- Bytes

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure attachment belongs to either idea or task (not both, not neither)
  CONSTRAINT attachments_target_check CHECK (
    (idea_id IS NOT NULL AND task_id IS NULL) OR
    (idea_id IS NULL AND task_id IS NOT NULL)
  )
);

-- ============================================
-- 5. LINKS TABLE (POLYMORPHIC)
-- ============================================

CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic association: either idea_id or task_id
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Link details
  url TEXT NOT NULL,
  title TEXT,                     -- User-provided or auto-fetched
  favicon TEXT,                   -- Emoji or URL

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure link belongs to either idea or task (not both, not neither)
  CONSTRAINT links_target_check CHECK (
    (idea_id IS NOT NULL AND task_id IS NULL) OR
    (idea_id IS NULL AND task_id IS NOT NULL)
  )
);

-- ============================================
-- 6. ADD PRIORITY TO TASKS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'priority'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
    COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, high, urgent';
  END IF;
END $$;

-- ============================================
-- 7. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_labels_idea_id ON idea_labels(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_labels_label_id ON idea_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_label_id ON task_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_attachments_idea_id ON attachments(idea_id) WHERE idea_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_idea_id ON links(idea_id) WHERE idea_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_task_id ON links(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority) WHERE priority IS NOT NULL;

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================

-- Labels RLS
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own labels"
ON labels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own labels"
ON labels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels"
ON labels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels"
ON labels FOR DELETE
USING (auth.uid() = user_id);

-- Idea Labels RLS
ALTER TABLE idea_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view labels on their ideas"
ON idea_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_labels.idea_id AND ideas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add labels to their ideas"
ON idea_labels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_id AND ideas.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove labels from their ideas"
ON idea_labels FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_labels.idea_id AND ideas.user_id = auth.uid()
  )
);

-- Task Labels RLS
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view labels on their tasks"
ON task_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = task_labels.task_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add labels to their tasks"
ON task_labels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = task_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove labels from their tasks"
ON task_labels FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = task_labels.task_id AND i.user_id = auth.uid()
  )
);

-- Attachments RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments on their items"
ON attachments FOR SELECT
USING (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = attachments.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = attachments.task_id AND i.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create attachments on their items"
ON attachments FOR INSERT
WITH CHECK (
  auth.uid() = uploaded_by
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

CREATE POLICY "Users can delete attachments on their items"
ON attachments FOR DELETE
USING (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = attachments.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = attachments.task_id AND i.user_id = auth.uid()
  ))
);

-- Links RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links on their items"
ON links FOR SELECT
USING (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = links.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = links.task_id AND i.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create links on their items"
ON links FOR INSERT
WITH CHECK (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = task_id AND i.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their links"
ON links FOR UPDATE
USING (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = links.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = links.task_id AND i.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can delete links on their items"
ON links FOR DELETE
USING (
  (idea_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = links.idea_id AND ideas.user_id = auth.uid()
  ))
  OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN ideas i ON t.idea_id = i.id
    WHERE t.id = links.task_id AND i.user_id = auth.uid()
  ))
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'labels';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attachments';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'links';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority';

-- ============================================
-- SUCCESS!
-- ============================================
-- V1.3 Rich Cards migration complete.
-- Tables created:
-- - labels (user-scoped)
-- - idea_labels (junction)
-- - task_labels (junction)
-- - attachments (polymorphic)
-- - links (polymorphic)
-- - tasks.priority column added
-- ============================================
