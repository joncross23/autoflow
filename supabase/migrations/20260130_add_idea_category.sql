-- Add category column to ideas table
-- Values: innovation, optimisation, cost_reduction, compliance
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS category TEXT;

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas (category) WHERE category IS NOT NULL;
