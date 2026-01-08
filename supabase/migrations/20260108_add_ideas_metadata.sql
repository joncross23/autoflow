-- Add metadata column to ideas table for storing structured data like guided capture Q&A
-- Migration: 20260108_add_ideas_metadata

-- Add metadata column (JSONB for flexible structured data)
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSONB queries
-- Useful for filtering ideas by metadata keys (e.g., ideas from guided capture)
CREATE INDEX IF NOT EXISTS idx_ideas_metadata
  ON ideas USING GIN(metadata);

-- Add comment for documentation
COMMENT ON COLUMN ideas.metadata IS 'Structured metadata for ideas. Can contain guided_capture Q&A, import info, voice transcript, etc.';
