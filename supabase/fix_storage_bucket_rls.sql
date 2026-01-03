-- Fix Storage Bucket RLS Policies for Attachments
-- This fixes the StorageApiError: "new row violates row-level security policy"

-- First, check current storage policies
SELECT
  name,
  definition
FROM storage.policies
WHERE bucket_id = 'attachments';

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for attachments bucket to avoid conflicts
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete attachments" ON storage.objects;
DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_delete" ON storage.objects;

-- CREATE POLICIES FOR STORAGE BUCKET

-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to view files in their own folder
CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow authenticated users to delete files from their own folder
CREATE POLICY "Users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the policies were created
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%attachments%'
ORDER BY policyname;

-- Also verify the bucket exists and is configured correctly
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'attachments';
