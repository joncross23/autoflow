-- Migration: Add relationship_type to links table
-- Phase 7: Task Relationship Types
-- Allows task-to-task links to have semantic relationships (blocks, duplicates, etc.)

-- Add relationship_type column
ALTER TABLE links ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(50) DEFAULT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN links.relationship_type IS 'Relationship type for task-to-task links: related, blocks, is_blocked_by, duplicates, is_duplicated_by, split_to, split_from. NULL for URL and idea links.';
