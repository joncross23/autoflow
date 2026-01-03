-- Storage Bucket Policies for Attachments
-- Allows authenticated users to upload/view/delete files in their own folders
-- Fixes: StorageApiError "new row violates row-level security policy"

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete attachments" ON storage.objects;
DROP POLICY IF EXISTS "attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_delete" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files to their own folder
-- File path structure: {user_id}/{idea_id}/filename or {user_id}/tasks/{task_id}/filename
-- First folder must match the user's auth.uid()
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
