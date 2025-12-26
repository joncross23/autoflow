-- ============================================
-- Performance Optimization Migration
-- Adds indexes for frequently queried columns
-- ============================================

-- ============================================
-- SECTION 1: Ideas Table Indexes
-- ============================================

-- Index for updated_at sorting (heavily used)
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at
  ON ideas(updated_at DESC);

-- Composite index for RICE score filtering and sorting
CREATE INDEX IF NOT EXISTS idx_ideas_user_rice_score
  ON ideas(user_id, archived, rice_score DESC NULLS LAST)
  WHERE rice_score IS NOT NULL;

-- Index for horizon filtering
CREATE INDEX IF NOT EXISTS idx_ideas_horizon
  ON ideas(user_id, horizon)
  WHERE archived = false;

-- ============================================
-- SECTION 2: Tasks Table Indexes
-- ============================================

-- Index for column-based task board queries
CREATE INDEX IF NOT EXISTS idx_tasks_column_position
  ON tasks(column_id, position)
  WHERE column_id IS NOT NULL;

-- Index for task progress by idea
CREATE INDEX IF NOT EXISTS idx_tasks_idea_completed
  ON tasks(idea_id, completed)
  WHERE idea_id IS NOT NULL;

-- Index for updated_at sorting (search, recent items)
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at
  ON tasks(updated_at DESC);

-- ============================================
-- SECTION 3: Checklists & Items Indexes
-- ============================================

-- Index for fetching checklists by task
CREATE INDEX IF NOT EXISTS idx_checklists_task_id
  ON checklists(task_id)
  WHERE task_id IS NOT NULL;

-- Index for fetching checklists by idea
CREATE INDEX IF NOT EXISTS idx_checklists_idea_id
  ON checklists(idea_id)
  WHERE idea_id IS NOT NULL;

-- Index for fetching checklist items (high frequency)
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_position
  ON checklist_items(checklist_id, position);

-- ============================================
-- SECTION 4: Attachments Table Indexes
-- ============================================

-- Index for idea attachments
CREATE INDEX IF NOT EXISTS idx_attachments_idea_id
  ON attachments(idea_id, created_at DESC)
  WHERE idea_id IS NOT NULL;

-- Index for task attachments
CREATE INDEX IF NOT EXISTS idx_attachments_task_id
  ON attachments(task_id, created_at DESC)
  WHERE task_id IS NOT NULL;

-- ============================================
-- SECTION 5: Links Table Indexes
-- ============================================

-- Index for idea links
CREATE INDEX IF NOT EXISTS idx_links_idea_id
  ON links(idea_id, created_at DESC)
  WHERE idea_id IS NOT NULL;

-- Index for task links
CREATE INDEX IF NOT EXISTS idx_links_task_id
  ON links(task_id, created_at DESC)
  WHERE task_id IS NOT NULL;

-- Index for backlink lookups (exact URL match)
CREATE INDEX IF NOT EXISTS idx_links_url
  ON links(url)
  WHERE url LIKE 'idea://%' OR url LIKE 'task://%';

-- ============================================
-- SECTION 6: Labels Junction Table Indexes
-- ============================================

-- Index for fetching labels by idea (bulk label loading)
CREATE INDEX IF NOT EXISTS idx_idea_labels_idea_id
  ON idea_labels(idea_id);

-- Index for fetching labels by task
CREATE INDEX IF NOT EXISTS idx_task_labels_task_id
  ON task_labels(task_id);

-- Index for labels by user (for RLS and listing)
CREATE INDEX IF NOT EXISTS idx_labels_user_id
  ON labels(user_id);

-- ============================================
-- SECTION 7: Themes Junction Table Indexes
-- ============================================

-- Index for idea themes
CREATE INDEX IF NOT EXISTS idx_idea_themes_idea_id
  ON idea_themes(idea_id);

-- ============================================
-- SECTION 8: Views Table Indexes
-- ============================================

-- Index for saved views by user
CREATE INDEX IF NOT EXISTS idx_saved_views_user_id
  ON saved_views(user_id);

-- Composite index for default view lookup
CREATE INDEX IF NOT EXISTS idx_saved_views_user_default
  ON saved_views(user_id, is_default)
  WHERE is_default = true;

-- ============================================
-- SECTION 9: Activity Log Indexes
-- ============================================

-- Index for idea activity
CREATE INDEX IF NOT EXISTS idx_activity_log_idea_id
  ON activity_log(idea_id, created_at DESC)
  WHERE idea_id IS NOT NULL;

-- Index for task activity
CREATE INDEX IF NOT EXISTS idx_activity_log_task_id
  ON activity_log(task_id, created_at DESC)
  WHERE task_id IS NOT NULL;

-- ============================================
-- SECTION 10: Comments Table Indexes
-- ============================================

-- Index for idea comments
CREATE INDEX IF NOT EXISTS idx_comments_idea_id
  ON comments(idea_id, created_at)
  WHERE idea_id IS NOT NULL;

-- Index for task comments
CREATE INDEX IF NOT EXISTS idx_comments_task_id
  ON comments(task_id, created_at)
  WHERE task_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_ideas_updated_at IS 'Optimizes ideas list sorting by updated_at';
COMMENT ON INDEX idx_tasks_column_position IS 'Optimizes task board column loading';
COMMENT ON INDEX idx_tasks_idea_completed IS 'Optimizes task progress calculation per idea';
COMMENT ON INDEX idx_links_url IS 'Optimizes backlink lookups for internal links';
COMMENT ON INDEX idx_checklist_items_checklist_position IS 'Optimizes checklist items loading';
