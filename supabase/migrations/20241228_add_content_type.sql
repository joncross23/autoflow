-- Add content_type column to ideas table
-- Flexible TEXT column with no enum constraint for extensibility
-- New types can be added in code without migrations

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT NULL;

-- Partial index for filtering (only indexes non-null values)
CREATE INDEX IF NOT EXISTS idx_ideas_content_type
  ON ideas(user_id, content_type)
  WHERE content_type IS NOT NULL;

COMMENT ON COLUMN ideas.content_type IS 'Content categorisation: idea, read, watch, listen, note, etc. Nullable - unset until explicitly categorised.';
