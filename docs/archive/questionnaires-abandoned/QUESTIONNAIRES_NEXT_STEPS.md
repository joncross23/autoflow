# Questionnaires Feature - Next Steps

**Date**: 2026-01-08
**Current Status**: Feature complete, merged to `develop`, awaiting deployment

---

## Critical Path to Production

### Step 1: Run Database Migration ⚠️ REQUIRED

**Why**: The `questionnaires`, `questionnaire_responses`, and `response_ideas` tables don't exist yet.

**Where**: Supabase Dashboard → SQL Editor

**Migration File**: `supabase/migrations/20260107_questionnaires.sql`

**Options**:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/icdjurapdmimfdecgngw/sql
2. Click "New Query"
3. Copy entire contents of `supabase/migrations/20260107_questionnaires.sql`
4. Paste into SQL editor
5. Click "Run"
6. Verify success: Check "Table Editor" for new tables

#### Option B: Via Supabase CLI (Alternative)
```bash
# If you have Supabase CLI installed
supabase db push

# Or run migration directly
supabase db execute --file supabase/migrations/20260107_questionnaires.sql
```

**Verification**:
```sql
-- Run this query to verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('questionnaires', 'questionnaire_responses', 'response_ideas');

-- Should return 3 rows
```

**Expected Result**: 3 tables created, RLS policies applied, default "automation-audit" form seeded.

---

### Step 2: Verify Staging Deployment (Optional but Recommended)

**When**: After migration is run

**Access Staging**:
- **URL**: https://autoflow-staging.vercel.app/forms/automation-audit
- **Protection**: Vercel SSO may be enabled (requires Vercel authentication)

**Test Checklist**:
- [ ] Form page loads without errors
- [ ] Progress bar shows "Question 1 of 7" and "14% complete"
- [ ] Question dots appear (7 dots)
- [ ] Can type in textarea, character count updates
- [ ] "Next Question" button navigates forward
- [ ] "Previous" button works after first question
- [ ] Auto-save works (type answer, refresh page, answer persists)
- [ ] Can reach contact page (question 7)
- [ ] Contact validation works (email must contain @)
- [ ] Form submits successfully, shows thank you page
- [ ] Preview mode works with `?preview=true` parameter

**To Access Protected Staging**:
1. Go to https://vercel.com/joncross23-8264/autoflow/deployments
2. Find latest deployment from `develop` branch
3. Click "Visit" button (bypasses SSO protection)
4. Or disable deployment protection in project settings

---

### Step 3: Merge to Production

**When**: After staging verification (or skip staging if confident)

**Commands**:
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

**What Happens**:
- Vercel auto-deploys `main` → https://autoflow23.vercel.app
- Production will have same code as staging
- **IMPORTANT**: Migration must be run on production database too (if different from staging)

**Verification**:
```bash
# Check production form
curl -I https://autoflow23.vercel.app/forms/automation-audit
# Should return HTTP 200 (after migration)
```

---

### Step 4: Configure Rate Limiting (Optional but Recommended)

**Why**: Prevent abuse and control API costs

**Setup Upstash Redis**:
1. Go to https://upstash.com/
2. Create account / login
3. Create new Redis database (free tier available)
4. Copy REST URL and REST TOKEN

**Add to Vercel Environment Variables**:
1. Go to https://vercel.com/joncross23-8264/autoflow/settings/environment-variables
2. Add `UPSTASH_REDIS_REST_URL` (value from Upstash)
3. Add `UPSTASH_REDIS_REST_TOKEN` (value from Upstash)
4. Apply to: Production, Preview, Development
5. Redeploy for changes to take effect

**Limits Applied**:
- Form views: 60 per minute per IP
- Form submissions: 5 per hour per IP

**Note**: If not configured, rate limiting is disabled but feature still works.

---

## Post-Deployment Tasks

### Immediate (Within 24 Hours)

1. **Monitor Vercel Logs**
   - Check for errors: https://vercel.com/joncross23-8264/autoflow/logs
   - Look for:
     - Database connection errors
     - RLS policy violations
     - AI extraction failures

2. **Test Production Form**
   - Submit a real response to https://autoflow23.vercel.app/forms/automation-audit
   - Verify submission appears in Supabase database
   - Test AI extraction: `POST /api/responses/[id]/extract`

3. **Check Database**
   ```sql
   -- View submissions
   SELECT id, submitted_at, extraction_status
   FROM questionnaire_responses
   ORDER BY submitted_at DESC
   LIMIT 10;

   -- Check extracted ideas
   SELECT i.title, i.source_type, ri.extraction_confidence
   FROM ideas i
   JOIN response_ideas ri ON i.id = ri.idea_id
   ORDER BY i.created_at DESC;
   ```

### Short-Term (Next Sprint)

4. **Build Management UI**
   - Dashboard page: `/dashboard/questionnaires`
   - List all questionnaires with stats
   - View responses for each questionnaire
   - Trigger AI extraction from UI

5. **Add Response Viewer**
   - Modal showing Q&A pairs
   - Extraction status badge
   - Link to extracted ideas
   - Manual extraction button

6. **Create Questionnaire Editor**
   - Simple text-based question editor
   - Duplicate questions
   - Reorder via drag-drop (future)
   - Toggle `is_active` and `auto_extract`

### Medium-Term (Future Enhancements)

7. **Email Notifications**
   - Send confirmation to respondents
   - Alert form creator when new response received
   - Weekly digest of submissions

8. **Analytics Dashboard**
   - Submission metrics (count, completion rate)
   - Average time to complete
   - Drop-off points (which questions)
   - Extraction success rate

9. **Advanced Features**
   - Multi-step wizard (progressive disclosure)
   - Conditional questions (skip logic)
   - File uploads in responses
   - Custom branding per questionnaire

---

## Rollback Plan

**If Issues Occur in Production**:

### Option 1: Revert Code
```bash
git checkout main
git revert cdfdbe8  # Revert latest questionnaires commit
git push origin main
```

### Option 2: Revert Migration (Dangerous)
```sql
-- Only if absolutely necessary - THIS DELETES ALL DATA
DROP TABLE IF EXISTS response_ideas CASCADE;
DROP TABLE IF EXISTS questionnaire_responses CASCADE;
DROP TABLE IF EXISTS questionnaires CASCADE;

-- Revert ideas table changes
ALTER TABLE ideas
  DROP COLUMN IF EXISTS source_type,
  DROP COLUMN IF EXISTS source_id,
  DROP COLUMN IF EXISTS intended_owner_id;
```

**⚠️ WARNING**: Migration rollback will delete all questionnaire data. Only use as last resort.

### Option 3: Hotfix
```bash
git checkout main
git checkout -b hotfix/questionnaires-fix
# Make fixes
git commit -m "hotfix: fix critical issue"
git checkout main
git merge hotfix/questionnaires-fix
git push origin main
```

---

## Testing Checklist (Pre-Production)

Before merging to `main`, verify:

- [ ] Database migration runs without errors
- [ ] Form page loads on staging
- [ ] Form submission works (check Supabase for response row)
- [ ] Thank you page appears after submission
- [ ] Auto-save to localStorage works
- [ ] Preview mode works (`?preview=true`)
- [ ] 404 page shows for invalid slug
- [ ] Rate limiting works (if configured)
- [ ] AI extraction endpoint returns ideas
- [ ] Ideas appear in dashboard after extraction
- [ ] No console errors in browser
- [ ] No server errors in Vercel logs
- [ ] Mobile responsive (test on phone)
- [ ] Accessibility (test with screen reader if possible)

---

## Success Criteria

**Feature is considered successfully deployed when**:

1. ✅ Migration run on production database
2. ✅ Form accessible at `/forms/automation-audit`
3. ✅ Public users can submit responses without authentication
4. ✅ Responses stored in `questionnaire_responses` table
5. ✅ AI extraction creates ideas linked to responses
6. ✅ No errors in Vercel production logs (24hr period)
7. ✅ At least 1 real submission tested end-to-end

**Optional Success Criteria**:
- ⭐ Rate limiting configured and working
- ⭐ Management UI built (future sprint)
- ⭐ Email notifications configured (future sprint)

---

## Support & Troubleshooting

### Common Issues

**Issue**: Form shows "Server Components render error"
- **Cause**: Migration not run, tables don't exist
- **Fix**: Run migration in Supabase SQL Editor

**Issue**: Form submission returns 500 error
- **Cause**: RLS policy blocking anonymous INSERT
- **Fix**: Verify RLS policy exists: `SELECT * FROM pg_policies WHERE tablename = 'questionnaire_responses';`

**Issue**: Rate limit exceeded immediately
- **Cause**: Upstash Redis not configured
- **Fix**: Add environment variables or ignore (feature still works)

**Issue**: AI extraction fails with 401
- **Cause**: Missing `ANTHROPIC_API_KEY` environment variable
- **Fix**: Add to Vercel environment variables

**Issue**: Ideas not appearing after extraction
- **Cause**: RLS policy blocking idea visibility
- **Fix**: Check `intended_owner_id` matches current user

### Logs to Check

**Vercel Runtime Logs**:
- https://vercel.com/joncross23-8264/autoflow/logs

**Supabase Logs**:
- https://supabase.com/dashboard/project/icdjurapdmimfdecgngw/logs/explorer

**Local Development**:
```bash
# Run dev server
npm run dev

# Check for errors
# Visit http://localhost:3000/forms/automation-audit
```

---

## Documentation Updates Needed

After deployment:

1. Update `docs/CURRENT_STATE.md`
   - Add questionnaires to "Completed Features"
   - Update "Current Phase" if needed

2. Update `docs/ARCHITECTURE.md`
   - Add "Questionnaires System" section
   - Document data flow
   - Explain RLS strategy

3. Update `README.md` (if needed)
   - Add link to form in demo/features section

4. Create user guide (future)
   - How to create a questionnaire
   - How to view responses
   - How to extract ideas from responses

---

## Contact / Questions

**Feature Author**: Claude Sonnet 4.5 (via Claude Code)
**Implementation Date**: 2026-01-08
**Total Lines Added**: 3,980
**Files Changed**: 34

**Key Files for Reference**:
- Migration: `supabase/migrations/20260107_questionnaires.sql`
- Form Component: `src/components/forms/PublicQuestionnaireForm.tsx`
- API Routes: `src/app/api/forms/[slug]/` and `src/app/api/questionnaires/`
- Tests: `e2e/questionnaires.spec.ts`
- State Doc: `docs/QUESTIONNAIRES_DEPLOYMENT_STATE.md`
