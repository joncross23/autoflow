-- ============================================
-- AutoFlow - V1.1 RICE Scoring Migration
-- Version: 1.1.0
-- ============================================
-- This migration adds RICE scoring fields to ideas:
-- - Reach: How many people/processes impacted (1-10)
-- - Impact: Significance per instance (0.25, 0.5, 1, 2, 3)
-- - Confidence: How confident in estimates (0-100%)
-- - Effort: Work required in person-weeks (1-10)
--
-- RICE Score = (Reach × Impact × Confidence) / Effort
-- ============================================

-- ============================================
-- 1. ADD RICE FIELDS TO IDEAS TABLE
-- ============================================

DO $$
BEGIN
  -- Add reach field (1-10 scale: how many users/processes affected)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'rice_reach') THEN
    ALTER TABLE ideas ADD COLUMN rice_reach INTEGER;
  END IF;

  -- Add impact field (0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'rice_impact') THEN
    ALTER TABLE ideas ADD COLUMN rice_impact DECIMAL(3,2);
  END IF;

  -- Add confidence field (0-100 percentage)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'rice_confidence') THEN
    ALTER TABLE ideas ADD COLUMN rice_confidence INTEGER;
  END IF;

  -- Add effort field (1-10 scale: person-weeks equivalent)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'rice_effort') THEN
    ALTER TABLE ideas ADD COLUMN rice_effort INTEGER;
  END IF;

  -- Add calculated RICE score (computed, but stored for efficient sorting)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ideas' AND column_name = 'rice_score') THEN
    ALTER TABLE ideas ADD COLUMN rice_score DECIMAL(10,2);
  END IF;
END $$;

-- Add check constraints for valid ranges
DO $$
BEGIN
  -- Reach: 1-10
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ideas_rice_reach_range') THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_rice_reach_range
      CHECK (rice_reach IS NULL OR (rice_reach >= 1 AND rice_reach <= 10));
  END IF;

  -- Impact: 0.25, 0.5, 1, 2, or 3
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ideas_rice_impact_range') THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_rice_impact_range
      CHECK (rice_impact IS NULL OR rice_impact IN (0.25, 0.5, 1, 2, 3));
  END IF;

  -- Confidence: 0-100
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ideas_rice_confidence_range') THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_rice_confidence_range
      CHECK (rice_confidence IS NULL OR (rice_confidence >= 0 AND rice_confidence <= 100));
  END IF;

  -- Effort: 1-10
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ideas_rice_effort_range') THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_rice_effort_range
      CHECK (rice_effort IS NULL OR (rice_effort >= 1 AND rice_effort <= 10));
  END IF;
END $$;

-- ============================================
-- 2. CREATE FUNCTION TO CALCULATE RICE SCORE
-- ============================================

CREATE OR REPLACE FUNCTION calculate_rice_score(
  p_reach INTEGER,
  p_impact DECIMAL(3,2),
  p_confidence INTEGER,
  p_effort INTEGER
) RETURNS DECIMAL(10,2) AS $$
BEGIN
  -- Return NULL if any required field is missing
  IF p_reach IS NULL OR p_impact IS NULL OR p_confidence IS NULL OR p_effort IS NULL OR p_effort = 0 THEN
    RETURN NULL;
  END IF;

  -- RICE = (Reach × Impact × Confidence%) / Effort
  RETURN ROUND((p_reach * p_impact * (p_confidence::DECIMAL / 100)) / p_effort, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 3. CREATE TRIGGER TO AUTO-CALCULATE RICE SCORE
-- ============================================

CREATE OR REPLACE FUNCTION update_rice_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rice_score := calculate_rice_score(
    NEW.rice_reach,
    NEW.rice_impact,
    NEW.rice_confidence,
    NEW.rice_effort
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_rice_score ON ideas;

-- Create trigger to auto-calculate on insert/update
CREATE TRIGGER trigger_update_rice_score
  BEFORE INSERT OR UPDATE OF rice_reach, rice_impact, rice_confidence, rice_effort
  ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_rice_score();

-- ============================================
-- 4. ADD INDEXES FOR RICE SORTING
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ideas_rice_score ON ideas(rice_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ideas_rice_impact ON ideas(rice_impact);
CREATE INDEX IF NOT EXISTS idx_ideas_rice_effort ON ideas(rice_effort);

-- ============================================
-- 5. SAVED VIEWS TABLE
-- ============================================
-- User-defined filter presets for quick switching

CREATE TABLE IF NOT EXISTS saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  column_config JSONB,  -- Custom column visibility/order for this view
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved views"
ON saved_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved views"
ON saved_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved views"
ON saved_views FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved views"
ON saved_views FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON saved_views(user_id);

-- ============================================
-- 6. PUBLISHED VIEWS TABLE
-- ============================================
-- Shareable read-only views for stakeholders

CREATE TABLE IF NOT EXISTS published_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_view_id UUID REFERENCES saved_views(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,  -- URL-friendly identifier
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  column_config JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,  -- Optional expiration
  password_hash TEXT,  -- Optional password protection
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Published views are publicly readable (by slug) but only owners can modify
ALTER TABLE published_views ENABLE ROW LEVEL SECURITY;

-- Anyone can view active published views (for public sharing)
CREATE POLICY "Anyone can view active published views"
ON published_views FOR SELECT
USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Only owners can modify their published views
CREATE POLICY "Users can manage their published views"
ON published_views FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_published_views_user_id ON published_views(user_id);
CREATE INDEX IF NOT EXISTS idx_published_views_slug ON published_views(slug);
CREATE INDEX IF NOT EXISTS idx_published_views_active ON published_views(is_active) WHERE is_active = TRUE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify migration was successful:

-- Check RICE fields added to ideas
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'ideas' AND column_name LIKE 'rice_%';

-- Check saved_views table
-- SELECT * FROM saved_views LIMIT 1;

-- Check published_views table
-- SELECT * FROM published_views LIMIT 1;

-- Test RICE calculation
-- SELECT calculate_rice_score(5, 2, 80, 3);  -- Should return ~2.67

-- ============================================
-- SUCCESS!
-- ============================================
-- V1.1 RICE Scoring migration complete.
-- The database now supports:
-- - RICE scoring fields on ideas (reach, impact, confidence, effort)
-- - Auto-calculated rice_score with trigger
-- - Saved filter views for quick access
-- - Published views for stakeholder sharing
-- ============================================
