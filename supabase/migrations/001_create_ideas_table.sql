-- Create ideas table for Phase 3: Idea Capture
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Create enum types
CREATE TYPE idea_status AS ENUM ('new', 'evaluating', 'prioritised', 'converting', 'archived');
CREATE TYPE idea_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'adhoc');

-- Create ideas table
CREATE TABLE ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status idea_status DEFAULT 'new' NOT NULL,
  frequency idea_frequency,
  time_spent INTEGER, -- minutes per occurrence
  owner TEXT,
  pain_points TEXT,
  desired_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries by user
CREATE INDEX ideas_user_id_idx ON ideas(user_id);
CREATE INDEX ideas_status_idx ON ideas(status);
CREATE INDEX ideas_created_at_idx ON ideas(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own ideas
CREATE POLICY "Users can view their own ideas"
  ON ideas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own ideas
CREATE POLICY "Users can create their own ideas"
  ON ideas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update their own ideas"
  ON ideas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete their own ideas"
  ON ideas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
