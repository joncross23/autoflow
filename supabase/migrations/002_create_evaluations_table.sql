-- Create priority enum
CREATE TYPE evaluation_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create AI evaluations table
CREATE TABLE ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  complexity_score INTEGER NOT NULL CHECK (complexity_score >= 1 AND complexity_score <= 5),
  complexity_rationale TEXT NOT NULL,
  roi_score INTEGER NOT NULL CHECK (roi_score >= 1 AND roi_score <= 5),
  roi_rationale TEXT NOT NULL,
  time_saved_hours NUMERIC NOT NULL,
  time_saved_rationale TEXT NOT NULL,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  risks TEXT[] NOT NULL DEFAULT '{}',
  overall_priority evaluation_priority NOT NULL,
  overall_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for fast lookups by idea
CREATE INDEX idx_evaluations_idea_id ON ai_evaluations(idea_id);

-- Create index for getting latest evaluation per idea
CREATE INDEX idx_evaluations_idea_created ON ai_evaluations(idea_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view evaluations for their own ideas
CREATE POLICY "Users can view own idea evaluations"
  ON ai_evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = ai_evaluations.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

-- Policy: Users can insert evaluations for their own ideas (via API route)
CREATE POLICY "Users can create evaluations for own ideas"
  ON ai_evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = ai_evaluations.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

-- Policy: Users can delete evaluations for their own ideas
CREATE POLICY "Users can delete own idea evaluations"
  ON ai_evaluations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = ai_evaluations.idea_id
      AND ideas.user_id = auth.uid()
    )
  );
