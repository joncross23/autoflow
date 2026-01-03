# Fix Attachments RLS Policy Violation

## Issue
Attachment uploads are failing with the error:
```
Failed to upload file: new row violates row-level security policy
StorageApiError: new row violates row-level security policy
```

## Root Cause
There are **TWO** RLS policies that need to be applied:

1. ✅ **Database table RLS** - Policies for the `attachments` table (already applied)
2. ❌ **Storage bucket RLS** - Policies for the `attachments` storage bucket (MISSING - this is causing the error)

The error is a `StorageApiError`, which means the file upload to the storage bucket is being blocked by missing RLS policies on `storage.objects`, not the database table.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Apply Storage Bucket RLS Policies (CRITICAL - Use Dashboard UI!)

**Important**: Storage policies cannot be created via SQL in hosted Supabase. You must use the Dashboard UI.

**See the complete guide**: [supabase/STORAGE_POLICIES_GUIDE.md](cci:1://file:///Users/jonx/autoflow/supabase/STORAGE_POLICIES_GUIDE.md:0:0-0:0)

**Quick steps**:
1. Go to [Storage → Policies](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw/storage/policies) in your Supabase Dashboard
2. Create 3 policies for the `attachments` bucket:
   - **INSERT**: `Users can upload attachments` with expression: `(bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)`
   - **SELECT**: `Users can view attachments` with expression: `(bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)`
   - **DELETE**: `Users can delete attachments` with expression: `(bucket_id = 'attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)`

See [STORAGE_POLICIES_GUIDE.md](cci:1://file:///Users/jonx/autoflow/supabase/STORAGE_POLICIES_GUIDE.md:0:0-0:0) for detailed screenshots and instructions.

### Step 3: Verify Database Table RLS (Already Applied)
The database table RLS policies are already in place (as shown in your screenshot). You should see:

1. **Users can view attachments on their items** (SELECT)
2. **Users can create attachments on their items** (INSERT)
3. **Users can delete attachments on their items** (DELETE)

### Step 4: Test Attachment Upload
1. Go to your app (running on localhost:3000)
2. Try uploading an attachment to a task or idea
3. The upload should now succeed without RLS policy violations

## Technical Details

### Understanding the Two RLS Systems

#### 1. Database Table RLS (attachments table)
Controls who can insert/select/delete records in the `attachments` table:
```sql
uploaded_by = auth.uid()
```
- ✅ Already applied correctly
- Our code sets `uploaded_by: user.id` in [src/app/api/attachments/upload/route.ts:145](cci:1://file:///Users/jonx/autoflow/src/app/api/attachments/upload/route.ts:145:6-145:30)

#### 2. Storage Bucket RLS (storage.objects table)
Controls who can upload/download/delete **files** in the `attachments` bucket:
```sql
bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text
```
- ❌ This was missing - causing the `StorageApiError`
- Allows users to upload files to their own folder: `{user_id}/{idea_id|tasks/task_id}/filename`
- The error occurs at line 121-127 in [src/app/api/attachments/upload/route.ts](cci:1://file:///Users/jonx/autoflow/src/app/api/attachments/upload/route.ts:121:6-127:8) during the storage upload step

### Code References
- **API Route**: [src/app/api/attachments/upload/route.ts](cci:1://file:///Users/jonx/autoflow/src/app/api/attachments/upload/route.ts:0:0-0:0) (sets `uploaded_by: user.id` on line 145)
- **Client Functions**: [src/lib/api/attachments.ts](cci:1://file:///Users/jonx/autoflow/src/lib/api/attachments.ts:0:0-0:0) (all upload functions set `uploaded_by: user.id`)
- **Migration File**: [supabase/migrations/20241222_fix_attachments_rls.sql](cci:1://file:///Users/jonx/autoflow/supabase/migrations/20241222_fix_attachments_rls.sql:0:0-0:0)

## Alternative: If Still Failing

If you still get RLS policy violations after applying the migration, check:

1. **Auth session**: Ensure you're logged in and the session is valid
2. **Database logs**: Check Supabase Dashboard → Logs → Database for detailed RLS error messages
3. **Policy verification**: Run this query to verify the policy exists:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can create attachments on their items';
   ```

## Next Steps
Once the RLS policy is applied and verified:
1. Test attachment uploads in both ideas and tasks
2. Test attachment deletion
3. Commit this fix to the repository
4. Deploy to staging/production (the same SQL will need to be run there)
