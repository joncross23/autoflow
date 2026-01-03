# Setup Storage Policies via Supabase CLI

## Prerequisites

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Get your project credentials from [Supabase Dashboard](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw/settings/api):
   - Project Reference ID: `icdjurapdmimfdecgngw`
   - Database Password (from Settings → Database)

## Step 1: Link Your Local Project

```bash
# Link to your remote Supabase project
supabase link --project-ref icdjurapdmimfdecgngw
```

When prompted, enter your database password.

## Step 2: Create Migration File

Create a new migration file:

```bash
supabase migration new create_storage_bucket_policies
```

This will create a file like `supabase/migrations/YYYYMMDDHHMMSS_create_storage_bucket_policies.sql`

## Step 3: Add Storage Policies to Migration

Edit the new migration file and add:

```sql
-- Create storage bucket policies for attachments
-- These policies allow authenticated users to manage files in their own folders

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
```

## Step 4: Push Migration to Remote Database

```bash
# Push the migration to your remote database
supabase db push
```

This will apply the migration using the service role, which has the necessary permissions to create policies on `storage.objects`.

## Step 5: Verify Policies Were Created

```bash
# Check if policies were created successfully
supabase db execute "
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%attachments%'
ORDER BY policyname;
"
```

You should see 3 policies listed.

## Alternative: Direct SQL Execution

If you don't want to create a migration file, you can execute SQL directly:

```bash
# Execute the SQL directly using the CLI
supabase db execute "
-- Drop any existing policies first
DROP POLICY IF EXISTS \"Users can upload attachments\" ON storage.objects;
DROP POLICY IF EXISTS \"Users can view attachments\" ON storage.objects;
DROP POLICY IF EXISTS \"Users can delete attachments\" ON storage.objects;

-- Create new policies
CREATE POLICY \"Users can upload attachments\"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY \"Users can view attachments\"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY \"Users can delete attachments\"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
"
```

## Troubleshooting

### Error: "Cannot find project ref"
Run `supabase link --project-ref icdjurapdmimfdecgngw` first.

### Error: "Invalid database password"
Get the correct password from: [Settings → Database](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw/settings/database)

### Error: "must be owner of table objects"
Make sure you're using `supabase db push` or `supabase db execute`, not direct SQL execution. The CLI uses the service role automatically.

## Test the Fix

After applying the policies:

1. Go to your app at http://localhost:3000
2. Navigate to a task or idea
3. Try uploading an attachment
4. The upload should now succeed without RLS errors

## Cleanup

If you used `supabase link`, you can unlink later with:

```bash
supabase unlink
```
