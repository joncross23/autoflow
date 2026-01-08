-- Update source_type constraint to replace 'questionnaire' with 'guided'
-- Migration: 20260108_update_source_type_constraint

-- Drop the old constraint
ALTER TABLE ideas
  DROP CONSTRAINT IF EXISTS ideas_source_type_check;

-- Add updated constraint with 'guided' instead of 'questionnaire'
ALTER TABLE ideas
  ADD CONSTRAINT ideas_source_type_check
  CHECK (source_type IN ('manual', 'guided', 'import', 'voice'));

-- Update comment for documentation
COMMENT ON COLUMN ideas.source_type IS 'Origin: manual (created by user), guided (guided capture flow), import (CSV), voice (voice capture)';

-- Update any existing 'questionnaire' values to 'guided' (if any remain)
UPDATE ideas SET source_type = 'guided' WHERE source_type = 'questionnaire';
