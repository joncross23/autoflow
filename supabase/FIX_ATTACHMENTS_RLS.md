# Fix Attachments RLS Policy Violation

## Issue
Attachment uploads are failing with the error:
```
Failed to upload file: new row violates row-level security policy
```

## Root Cause
The Row Level Security (RLS) policies for the `attachments` table haven't been applied to the remote Supabase database yet. The migration file exists ([supabase/migrations/20241222_fix_attachments_rls.sql](cci:1://file:///Users/jonx/autoflow/supabase/migrations/20241222_fix_attachments_rls.sql:0:0-0:0)) but needs to be applied manually via the Supabase SQL Editor.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/icdjurapdmimfdecgngw)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Apply the RLS Migration
1. Open the file [supabase/apply_attachments_rls.sql](cci:1://file:///Users/jonx/autoflow/supabase/apply_attachments_rls.sql:0:0-0:0)
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for the query to complete successfully

### Step 3: Verify the Fix
The SQL script includes verification queries that will show the current RLS policies. You should see output showing three policies:

1. **Users can view attachments on their items** (SELECT)
2. **Users can create attachments on their items** (INSERT) ← This is the critical one for the upload fix
3. **Users can delete attachments on their items** (DELETE)

### Step 4: Test Attachment Upload
1. Go to your app (running on localhost:3000)
2. Try uploading an attachment to a task or idea
3. The upload should now succeed without RLS policy violations

## Technical Details

### What the RLS Policy Does
The INSERT policy allows users to create attachments when:
```sql
uploaded_by = auth.uid()
```

This means:
- The `uploaded_by` field must match the authenticated user's ID
- Our code already sets this correctly in [src/app/api/attachments/upload/route.ts:145](cci:1://file:///Users/jonx/autoflow/src/app/api/attachments/upload/route.ts:145:6-145:30)
- The policy just needs to be enabled in the database

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
