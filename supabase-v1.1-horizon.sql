-- ============================================
-- AutoFlow - V1.1 Planning Horizon Migration
-- Version: 1.1.1
-- ============================================
-- This migration adds Now/Next/Later planning horizon to ideas
-- ============================================

-- Add horizon field to ideas table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'horizon') THEN
    ALTER TABLE ideas ADD COLUMN horizon VARCHAR(10) DEFAULT NULL;
  END IF;
END $$;

-- Add check constraint for valid horizon values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ideas_horizon_values') THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_horizon_values
      CHECK (horizon IS NULL OR horizon IN ('now', 'next', 'later'));
  END IF;
END $$;

-- Add index for filtering by horizon
CREATE INDEX IF NOT EXISTS idx_ideas_horizon ON ideas(horizon) WHERE horizon IS NOT NULL;

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'ideas' AND column_name = 'horizon';

-- ============================================
-- SUCCESS!
-- ============================================
-- Planning horizon field added to ideas.
-- Values: 'now', 'next', 'later', or NULL (unplanned)
-- ============================================
