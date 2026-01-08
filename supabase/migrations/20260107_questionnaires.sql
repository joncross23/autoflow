-- AutoFlow Questionnaires Feature Migration
-- Phase 1: Database Schema with Security Fixes
-- Created: 2026-01-07
-- Based on refined implementation plan with multi-agent review

-- ============================================
-- 1. QUESTIONNAIRES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,

  questions JSONB NOT NULL CHECK (jsonb_typeof(questions) = 'array'),
  questions_snapshot JSONB, -- Frozen version for active submissions

  is_active BOOLEAN DEFAULT true NOT NULL,
  auto_extract BOOLEAN DEFAULT false NOT NULL,

  response_count INTEGER DEFAULT 0 NOT NULL,
  last_response_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT slug_length CHECK (char_length(slug) BETWEEN 3 AND 100)
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS questionnaires_slug_unique ON questionnaires(slug);
CREATE INDEX IF NOT EXISTS idx_questionnaires_user_id ON questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_active_slug ON questionnaires(slug) WHERE is_active = true;

-- ============================================
-- 2. QUESTIONNAIRE_RESPONSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE RESTRICT,

  questions_snapshot JSONB NOT NULL, -- Immutable copy of questions at submission time
  answers JSONB NOT NULL CHECK (jsonb_typeof(answers) = 'object'),

  respondent_email TEXT,
  respondent_name TEXT,

  extraction_status TEXT DEFAULT 'pending' NOT NULL
    CHECK (extraction_status IN ('pending', 'processing', 'complete', 'failed')),
  extraction_error TEXT,
  ideas_extracted INTEGER DEFAULT 0 NOT NULL,
  extracted_at TIMESTAMPTZ,
  processing_started_at TIMESTAMPTZ,

  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_email CHECK (
    respondent_email IS NULL OR
    respondent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_responses_questionnaire_id ON questionnaire_responses(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_responses_extraction_status ON questionnaire_responses(extraction_status);
CREATE INDEX IF NOT EXISTS idx_responses_pending
  ON questionnaire_responses(questionnaire_id, submitted_at DESC)
  WHERE extraction_status = 'pending';

-- ============================================
-- 3. RESPONSE_IDEAS JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS response_ideas (
  response_id UUID NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  extraction_confidence NUMERIC(3,2) CHECK (extraction_confidence BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (response_id, idea_id)
);

CREATE INDEX IF NOT EXISTS idx_response_ideas_response ON response_ideas(response_id);
CREATE INDEX IF NOT EXISTS idx_response_ideas_idea ON response_ideas(idea_id);

-- ============================================
-- 4. MODIFY IDEAS TABLE
-- ============================================

-- Add source tracking columns
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'questionnaire', 'import', 'voice')),
  ADD COLUMN IF NOT EXISTS source_id UUID,
  ADD COLUMN IF NOT EXISTS intended_owner_id UUID REFERENCES auth.users(id);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_ideas_intended_owner ON ideas(intended_owner_id);
CREATE INDEX IF NOT EXISTS idx_ideas_source ON ideas(source_type, source_id);

-- Backfill existing data
UPDATE ideas SET source_type = 'manual' WHERE source_type IS NULL;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Questionnaires RLS
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own questionnaires" ON questionnaires;
CREATE POLICY "Users manage own questionnaires"
  ON questionnaires FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read active by slug" ON questionnaires;
CREATE POLICY "Public read active by slug"
  ON questionnaires FOR SELECT
  USING (is_active = true);

-- Responses RLS
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Template owners view responses" ON questionnaire_responses;
CREATE POLICY "Template owners view responses"
  ON questionnaire_responses FOR SELECT
  USING (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can submit responses" ON questionnaire_responses;
CREATE POLICY "Anyone can submit responses"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR true);

-- Ideas RLS (Updated for intended_owner_id)
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
CREATE POLICY "Users view owned or intended ideas"
  ON ideas FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = intended_owner_id);

-- Service role can insert ideas for extraction
-- This runs server-side with service_role key
DROP POLICY IF EXISTS "Service role creates extraction ideas" ON ideas;
CREATE POLICY "Service role creates extraction ideas"
  ON ideas FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    AND intended_owner_id IS NOT NULL
  );

-- Response Ideas RLS
ALTER TABLE response_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view response-idea links" ON response_ideas;
CREATE POLICY "Users view response-idea links"
  ON response_ideas FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE user_id = auth.uid() OR intended_owner_id = auth.uid()
    )
  );

-- ============================================
-- 6. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update response count when submission created
CREATE OR REPLACE FUNCTION update_questionnaire_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questionnaires
  SET
    response_count = response_count + 1,
    last_response_at = NOW()
  WHERE id = NEW.questionnaire_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_response_count ON questionnaire_responses;
CREATE TRIGGER increment_response_count
  AFTER INSERT ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_questionnaire_response_count();

-- Auto-update updated_at on questionnaires
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaires_updated_at ON questionnaires;
CREATE TRIGGER questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cleanup stuck extractions (run via pg_cron or manually)
CREATE OR REPLACE FUNCTION cleanup_stuck_extractions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE questionnaire_responses
  SET
    extraction_status = 'failed',
    extraction_error = 'Processing timeout - exceeded 5 minutes'
  WHERE extraction_status = 'processing'
    AND processing_started_at < NOW() - INTERVAL '5 minutes';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. SEED DEFAULT QUESTIONNAIRE (Optional)
-- ============================================

-- Default "AI & Automation Audit" questionnaire
-- Based on mockup: docs/mockups/questionnaire-form.jsx
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get first admin user (or create seed data with specific user)
  SELECT id INTO admin_user_id FROM auth.users LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO questionnaires (
      user_id,
      title,
      description,
      slug,
      questions,
      is_active,
      auto_extract
    ) VALUES (
      admin_user_id,
      'AI & Automation Audit',
      'Help us understand your automation opportunities. This takes about 5-10 minutes and your responses will be analysed by AI to identify high-impact improvements.',
      'automation-audit',
      '[
        {
          "id": "q1",
          "type": "long_text",
          "label": "What''s one task you personally do every single week that you absolutely shouldn''t, but it has to get done?",
          "hint": "Think about tasks that feel repetitive or below your pay grade.",
          "placeholder": "e.g., Manually updating spreadsheets with sales data every Monday morning...",
          "required": true,
          "position": 0
        },
        {
          "id": "q2",
          "type": "long_text",
          "label": "Describe one process in your business that''s a bit of a mess right now.",
          "hint": "Don''t worry about sounding negative — we''re looking for improvement opportunities.",
          "placeholder": "e.g., Our invoice approval process involves 5 different people and takes 2 weeks...",
          "required": true,
          "position": 1
        },
        {
          "id": "q3",
          "type": "long_text",
          "label": "On a typical week, how many hours do YOU personally spend on things that aren''t revenue-generating or strategic?",
          "hint": "Include time spent on admin, manual data entry, status updates, etc.",
          "placeholder": "e.g., About 15 hours on admin, reporting, and chasing updates...",
          "required": true,
          "position": 2
        },
        {
          "id": "q4",
          "type": "long_text",
          "label": "If you had an extra 20 hours per week back, what would you actually do with it? Be specific.",
          "hint": "This helps us understand what matters most to you.",
          "placeholder": "e.g., I''d finally focus on that partnership deal, spend more time with key clients...",
          "required": true,
          "position": 3
        },
        {
          "id": "q5",
          "type": "long_text",
          "label": "What''s the most annoying handoff between team members or systems?",
          "hint": "Where do things fall through the cracks?",
          "placeholder": "e.g., When marketing passes leads to sales, half the info is missing...",
          "required": true,
          "position": 4
        },
        {
          "id": "q6",
          "type": "long_text",
          "label": "Which reports or updates do you create manually that feel like they should be automatic?",
          "hint": "Include any recurring reports or data compilation tasks.",
          "placeholder": "e.g., Weekly team status reports, monthly client summaries, expense reconciliation...",
          "required": true,
          "position": 5
        }
      ]'::jsonb,
      true,
      false
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE questionnaires IS 'Discovery form templates created by users to capture automation ideas from external stakeholders';
COMMENT ON TABLE questionnaire_responses IS 'Public form submissions from respondents (no auth required)';
COMMENT ON TABLE response_ideas IS 'Junction table linking form responses to AI-extracted ideas';

COMMENT ON COLUMN questionnaires.questions IS 'Array of question objects with type, label, hint, placeholder, required, position';
COMMENT ON COLUMN questionnaires.questions_snapshot IS 'Frozen copy of questions for active forms (prevents breaking changes)';
COMMENT ON COLUMN questionnaires.auto_extract IS 'If true, automatically trigger AI extraction on new responses (default: false for cost control)';

COMMENT ON COLUMN questionnaire_responses.questions_snapshot IS 'Immutable copy of questions from submission time (ensures data integrity)';
COMMENT ON COLUMN questionnaire_responses.extraction_status IS 'Status: pending (not processed), processing (AI running), complete (ideas extracted), failed (error occurred)';

COMMENT ON COLUMN ideas.intended_owner_id IS 'For questionnaire-sourced ideas: the form creator who should see these ideas (not the system user)';
COMMENT ON COLUMN ideas.source_type IS 'Origin: manual (created by user), questionnaire (AI-extracted), import (CSV), voice (voice capture)';
