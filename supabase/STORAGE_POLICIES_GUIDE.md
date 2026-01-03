# Storage Bucket Policies Setup Guide

## Issue
The SQL approach failed with: `ERROR: 42501: must be owner of table objects`

In Supabase's hosted environment, storage bucket policies must be configured through the **Dashboard UI**, not SQL.

## Solution: Use Supabase Dashboard

### Step 1: Navigate to Storage Policies
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw)
2. Click **Storage** in the left sidebar
3. Find the `attachments` bucket
4. Click **Policies** (or the policies icon next to the bucket)

### Step 2: Create INSERT Policy
1. Click **New Policy**
2. Select **For full customization, use the policy editor**
3. Configure the policy:
   - **Policy Name**: `Users can upload attachments`
   - **Policy Command**: `INSERT`
   - **Target Roles**: `authenticated`
   - **WITH CHECK expression**:
     ```sql
     (bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
4. Click **Review** then **Save Policy**

### Step 3: Create SELECT Policy
1. Click **New Policy** again
2. Select **For full customization, use the policy editor**
3. Configure the policy:
   - **Policy Name**: `Users can view attachments`
   - **Policy Command**: `SELECT`
   - **Target Roles**: `authenticated`
   - **USING expression**:
     ```sql
     (bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
4. Click **Review** then **Save Policy**

### Step 4: Create DELETE Policy
1. Click **New Policy** again
2. Select **For full customization, use the policy editor**
3. Configure the policy:
   - **Policy Name**: `Users can delete attachments`
   - **Policy Command**: `DELETE`
   - **Target Roles**: `authenticated`
   - **USING expression**:
     ```sql
     (bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
4. Click **Review** then **Save Policy**

## Alternative: Using Policy Templates

Supabase also provides templates. If available, you can use:

1. **For INSERT**: Select template "Allow authenticated users to insert files in folders matching their user ID"
   - Modify the expression to check: `(storage.foldername(name))[1] = auth.uid()::text`

2. **For SELECT**: Select template "Allow authenticated users to read files in folders matching their user ID"
   - Modify the expression to check: `(storage.foldername(name))[1] = auth.uid()::text`

3. **For DELETE**: Select template "Allow authenticated users to delete files in folders matching their user ID"
   - Modify the expression to check: `(storage.foldername(name))[1] = auth.uid()::text`

## What These Policies Do

The policies enforce that users can only access files in their own folder:

- File path structure: `{user_id}/{idea_id}/filename.ext` or `{user_id}/tasks/{task_id}/filename.ext`
- First folder level must match `auth.uid()` (the user's ID)
- This ensures users can't access other users' files

## Verification

After creating all three policies:

1. Go back to your app at http://localhost:3000
2. Navigate to a task or idea
3. Try uploading an attachment
4. The upload should now succeed without RLS errors

## Troubleshooting

If uploads still fail:

1. Check the **Storage** → **Buckets** → `attachments` settings:
   - Verify the bucket exists
   - Check if "Public" is enabled (should be OFF for private attachments)
   - Verify allowed MIME types if configured

2. Check the policies are active:
   - Navigate to **Storage** → **Policies**
   - Ensure all three policies show as enabled

3. Check browser console for errors:
   - Open DevTools → Console
   - Look for detailed error messages about auth or storage
