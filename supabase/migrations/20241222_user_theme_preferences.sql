-- AutoFlow V1.6 Theme Preferences Migration
-- Stores user theme customisations in Supabase
-- Run with: supabase db push

-- ============================================
-- Create user_theme_preferences table
-- ============================================

CREATE TABLE IF NOT EXISTS user_theme_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current selection
  active_theme_id TEXT DEFAULT 'ocean',
  mode TEXT DEFAULT 'dark' CHECK (mode IN ('dark', 'light', 'system')),
  accent TEXT DEFAULT 'cyan' CHECK (accent IN ('cyan', 'blue', 'emerald', 'amber', 'indigo', 'rose')),

  -- Current background (computed from theme or custom)
  background_dark JSONB DEFAULT '{"type": "gradient", "solid": "#0d1f2d", "gradient": {"from": "#1e3a5f", "to": "#0d1f2d", "angle": 135}}'::jsonb,
  background_light JSONB DEFAULT '{"type": "solid", "solid": "#f0f9ff", "gradient": {"from": "#e0f2fe", "to": "#f0f9ff", "angle": 135}}'::jsonb,

  -- Custom themes (max 6)
  -- Each item: { id, name, accent, backgroundDark, backgroundLight }
  custom_themes JSONB DEFAULT '[]'::jsonb,

  -- Custom gradients (max 6)
  -- Each item: { id, name?, from, to, angle }
  custom_gradients JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own theme preferences" ON user_theme_preferences;
DROP POLICY IF EXISTS "Users can insert own theme preferences" ON user_theme_preferences;
DROP POLICY IF EXISTS "Users can update own theme preferences" ON user_theme_preferences;
DROP POLICY IF EXISTS "Users can delete own theme preferences" ON user_theme_preferences;

-- Users can only view their own preferences
CREATE POLICY "Users can view own theme preferences"
  ON user_theme_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own preferences
CREATE POLICY "Users can insert own theme preferences"
  ON user_theme_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own preferences
CREATE POLICY "Users can update own theme preferences"
  ON user_theme_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own preferences
CREATE POLICY "Users can delete own theme preferences"
  ON user_theme_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Auto-update timestamp trigger
-- ============================================

-- Use existing update_updated_at_column function if it exists,
-- otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for re-running migration)
DROP TRIGGER IF EXISTS update_user_theme_preferences_updated_at ON user_theme_preferences;

CREATE TRIGGER update_user_theme_preferences_updated_at
  BEFORE UPDATE ON user_theme_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_theme_preferences_user_id
  ON user_theme_preferences(user_id);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE user_theme_preferences IS 'Stores user theme customisation preferences for V1.6 theme system';
COMMENT ON COLUMN user_theme_preferences.active_theme_id IS 'Currently selected theme preset ID (ocean, forest, ember, midnight, rose, carbon) or custom theme ID';
COMMENT ON COLUMN user_theme_preferences.custom_themes IS 'Array of up to 6 custom themes created by the user';
COMMENT ON COLUMN user_theme_preferences.custom_gradients IS 'Array of up to 6 custom gradients saved by the user';
