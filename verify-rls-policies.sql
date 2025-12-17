-- ============================================
-- AutoFlow - VERIFY RLS Policies
-- ============================================
-- Run this in Supabase SQL Editor to check existing policies
-- ============================================

-- Check all policies for IDEAS table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ideas'
ORDER BY policyname;

-- Check all policies for EVALUATIONS table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'evaluations'
ORDER BY policyname;

-- Check all policies for PROJECTS table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- Check all policies for TASKS table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;

-- ============================================
-- Check if RLS is enabled on all tables
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('ideas', 'evaluations', 'projects', 'tasks')
ORDER BY tablename;
