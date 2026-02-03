-- Add position column to ideas table for drag-and-drop custom ordering
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Set initial positions based on creation order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS pos
  FROM ideas
)
UPDATE ideas SET position = ranked.pos FROM ranked WHERE ideas.id = ranked.id;

-- Index for efficient position-based sorting
CREATE INDEX IF NOT EXISTS idx_ideas_position ON ideas (user_id, position);
