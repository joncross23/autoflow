# Testing Questionnaires Feature (V1.7)

> **Status**: Feature complete, ready for testing
> **Branch**: `feature/questionnaires`
> **Build**: ✅ Passing

## Prerequisites

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Supabase Service Role (for AI extraction)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site URL (for server-side API calls)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to get Upstash Redis credentials:**
1. Go to https://console.upstash.com/
2. Create a new Redis database
3. Copy the REST URL and token

**Where to get Supabase Service Role Key:**
1. Go to your Supabase project settings
2. API section → "Service Role" key (keep this secret!)

### 2. Run Database Migration

```bash
# Apply the questionnaires migration
npx supabase db push
```

This creates:
- `questionnaires` table
- `questionnaire_responses` table
- `response_ideas` junction table
- Modifies `ideas` table (adds `source_type`, `source_id`, `intended_owner_id`)
- Seeds default "AI & Automation Audit" form (slug: `automation-audit`)

### 3. Start Development Server

```bash
npm run dev
```

## Test Scenarios

### Test 1: Public Form Submission

**URL**: http://localhost:3000/forms/automation-audit

**Expected Behavior:**
1. ✅ Page loads without authentication
2. ✅ Shows "AI & Automation Audit" title
3. ✅ Progress bar shows "Question 1 of 7"
4. ✅ Question dots at top (6 questions + 1 contact page)
5. ✅ Can navigate with Previous/Next buttons
6. ✅ Character count shows for each answer
7. ✅ "✓ Good detail" appears when ≥20 characters
8. ✅ Contact fields on final step (name + email required)
9. ✅ Submit button disabled until name and email filled
10. ✅ Success page shows after submission

**Test Auto-Save:**
1. Fill in some answers
2. Refresh the page
3. ✅ Answers should be restored from localStorage

### Test 2: Preview Mode

**URL**: http://localhost:3000/forms/automation-audit?preview=true

**Expected Behavior:**
1. ✅ Blue banner shows "Preview Mode - Submissions won't be saved"
2. ✅ Can fill out form normally
3. ✅ Submission doesn't actually save to database
4. ✅ Success page shows, but no response created

### Test 3: Rate Limiting

**Public Form View (60/min per IP):**
```bash
# Should succeed 60 times, then get 429 error
for i in {1..65}; do
  curl http://localhost:3000/api/forms/automation-audit
done
```

**Public Form Submit (5/hour per IP):**
```bash
# Should succeed 5 times, then get 429 error
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/forms/automation-audit/submit \
    -H "Content-Type: application/json" \
    -d '{"answers":{"q1":"test"}, "respondent_name":"Test", "respondent_email":"test@example.com"}'
done
```

**Expected Response (after limit):**
```json
{
  "error": "Rate limit exceeded. You can submit 5 responses per hour.",
  "limit": 5,
  "remaining": 0,
  "reset": 1234567890
}
```

### Test 4: Manual AI Extraction

**Prerequisites:**
- Submit at least one response via the public form
- Note the `response_id` from database

**Test via API:**
```bash
# Get response ID from database
psql $DATABASE_URL -c "SELECT id FROM questionnaire_responses LIMIT 1;"

# Trigger extraction
curl -X POST http://localhost:3000/api/responses/[response_id]/extract \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:**
1. ✅ Response status changes from "pending" → "processing" → "complete"
2. ✅ 2-5 ideas created in `ideas` table
3. ✅ Ideas have `source_type='questionnaire'`
4. ✅ Ideas have `intended_owner_id` set to form creator
5. ✅ Ideas visible in `/dashboard/ideas` for form creator

### Test 5: Auto-Extract (Optional)

**Setup:**
```sql
-- Enable auto-extract for the seeded form
UPDATE questionnaires
SET auto_extract = true
WHERE slug = 'automation-audit';
```

**Test:**
1. Submit a response via public form
2. Wait ~30 seconds
3. ✅ Check database - ideas should be auto-created
4. ✅ Check extraction status - should be "complete"

### Test 6: API Endpoints (Protected)

**Requires authentication** - test via Postman or curl with access token:

```bash
# List all questionnaires
GET /api/questionnaires

# Get single questionnaire
GET /api/questionnaires/[id]

# Create questionnaire
POST /api/questionnaires
{
  "title": "Test Form",
  "description": "Testing",
  "slug": "test-form",
  "questions": [
    {
      "id": "q1",
      "type": "long_text",
      "label": "Test question?",
      "required": true,
      "position": 0
    }
  ],
  "is_active": true,
  "auto_extract": false
}

# Update questionnaire
PUT /api/questionnaires/[id]
{
  "title": "Updated Title"
}

# Delete questionnaire (fails if responses exist)
DELETE /api/questionnaires/[id]

# List responses
GET /api/questionnaires/[id]/responses

# Trigger extraction
POST /api/responses/[response_id]/extract
```

## Database Validation

### Check Tables Created

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('questionnaires', 'questionnaire_responses', 'response_ideas');
```

**Expected:** All 3 tables exist

### Check Default Form Seeded

```sql
SELECT id, title, slug, is_active, array_length(questions, 1) as question_count
FROM questionnaires;
```

**Expected:**
- 1 row: "AI & Automation Audit"
- slug: "automation-audit"
- is_active: true
- question_count: 6

### Check Ideas Table Updated

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ideas'
  AND column_name IN ('source_type', 'source_id', 'intended_owner_id');
```

**Expected:** All 3 columns exist

### Check RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('questionnaires', 'questionnaire_responses', 'response_ideas', 'ideas')
ORDER BY tablename, policyname;
```

**Expected Policies:**
- `questionnaires`: "Users manage own questionnaires", "Public read active by slug"
- `questionnaire_responses`: "Template owners view responses", "Anyone can submit responses"
- `ideas`: "Users view owned or intended ideas", "Service role creates extraction ideas"
- `response_ideas`: "Users view response-idea links"

## Common Issues

### Issue: "Module not found: zod"
**Fix:** `npm install zod`

### Issue: "Upstash Redis URL missing"
**Fix:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`

### Issue: "Service role key missing"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Issue: Migration fails - "relation already exists"
**Fix:** The migration uses `IF NOT EXISTS` - should be safe to re-run. If issues persist, check for manual schema changes.

### Issue: Public form returns 404
**Fix:**
1. Check questionnaire is `is_active = true`
2. Verify slug matches URL (`/forms/automation-audit`)
3. Check RLS policies allow public SELECT

### Issue: Rate limit not working
**Fix:**
1. Verify Upstash Redis credentials
2. Check Redis dashboard for connection
3. Test with `curl` from different IPs

### Issue: AI extraction fails
**Fix:**
1. Check `ANTHROPIC_API_KEY` is set
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check response has valid answers (not empty)
4. Review extraction logs in database

## Success Criteria

✅ **MVP Complete When:**
1. Can access public form at `/forms/automation-audit`
2. Can submit responses without authentication
3. Responses are saved to database
4. Rate limiting prevents abuse (5/hour submit)
5. Manual extraction creates ideas with correct owner
6. Auto-extract works when enabled
7. Ideas appear in creator's dashboard
8. No TypeScript or build errors

## Next Steps

After successful testing:
1. Merge to `develop` branch
2. Deploy to staging for E2E tests
3. Build management UI (questionnaire list, editor, response viewer)
4. Add "Questionnaires" link to sidebar
5. Deploy to production

---

**Ready to test?** Start with Test 1 (Public Form Submission) above!
