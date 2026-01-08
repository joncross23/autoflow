# Questionnaires Feature - Pivot Plan

**Date**: 2026-01-08
**Issue**: Feature built for wrong use case

---

## Misalignment Analysis

### What Was Built
- **Target User**: Consultants sending forms to external clients
- **Access**: Public, unauthenticated
- **Flow**: Client submits → AI extracts → Ideas created for consultant
- **Complexity**: Rate limiting, anonymous clients, public RLS policies

### What's Actually Needed
- **Target User**: AutoFlow users capturing their own ideas
- **Access**: Internal, authenticated only
- **Flow**: User answers questions → Idea created directly for user
- **Complexity**: Much simpler, no public access needed

---

## Architecture Changes Required

### 1. Remove Public Access ❌ DELETE

**Files to Remove/Modify**:
- ❌ `src/app/forms/[slug]/page.tsx` - Public form page (not needed)
- ❌ `src/app/forms/[slug]/thank-you/page.tsx` - Public thank you (not needed)
- ❌ `src/app/api/forms/[slug]/route.ts` - Public API (not needed)
- ❌ `src/app/api/forms/[slug]/submit/route.ts` - Anonymous submission (not needed)
- ❌ `src/lib/supabase/server.ts` - Remove `createAnonClient()` function
- ❌ `src/lib/ratelimit.ts` - Not needed for internal use
- ⚠️ `src/lib/api/responses.ts` - Remove anonymous client, use authenticated only

**Database Changes**:
- ❌ Remove RLS policy: "Anyone can submit responses"
- ❌ Remove `response_ideas` junction table (create ideas directly)
- ⚠️ Simplify `questionnaire_responses` - user_id required, no anonymous

### 2. Add Internal UI ✅ NEW

**New Components**:
```
src/app/dashboard/ideas/capture/page.tsx        - Guided capture page
src/components/ideas/GuidedCaptureForm.tsx      - Question flow
src/components/ideas/QuestionStep.tsx           - Single question component
```

**Navigation Updates**:
```
src/app/dashboard/ideas/page.tsx                - Add "Guided Capture" button
src/app/dashboard/page.tsx                      - Add audit card/widget
```

### 3. Simplify Data Model ✅ MODIFY

**Current Schema** (Too Complex):
```
questionnaires (form templates)
  ↓
questionnaire_responses (submissions)
  ↓
response_ideas (junction table)
  ↓
ideas (AI extracted)
```

**Simplified Schema** (Direct):
```
idea_capture_templates (optional - just 1 default template)
  ↓
ideas (created directly from form)
  └── source_type = 'guided_capture'
```

**New Approach**:
- Remove `questionnaire_responses` table entirely
- Remove `response_ideas` junction table
- Create ideas directly with all answers in `metadata` JSONB field
- No AI extraction needed - form data IS the idea

### 4. New User Flow ✅ REDESIGN

**Entry Points**:
1. **Ideas Page**: "New Idea" → dropdown with "Quick Add" and "Guided Capture"
2. **Dashboard**: "Take Automation Audit" card

**Flow**:
```
1. User clicks "Guided Capture"
   ↓
2. Shows multi-step form (6 questions)
   ↓
3. User answers questions about their automation problem
   ↓
4. On submit: Create idea directly with:
   - title: extracted from question 1 answer
   - description: compiled from all answers
   - metadata: full Q&A JSON
   - source_type: 'guided_capture'
   - status: 'new'
   ↓
5. Redirect to idea detail slider (newly created idea)
   ↓
6. User can run AI evaluation immediately
```

---

## Simplified Database Schema

### Drop These Tables
```sql
DROP TABLE IF EXISTS response_ideas CASCADE;
DROP TABLE IF EXISTS questionnaire_responses CASCADE;
DROP TABLE IF EXISTS questionnaires CASCADE;
```

### Keep This Structure
```sql
-- ideas table already has what we need
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Store Q&A in metadata:
{
  "capture_type": "guided",
  "questions": [
    {
      "question": "What's one task you do every week that you shouldn't?",
      "answer": "Manually updating spreadsheets with sales data"
    },
    // ... more Q&A pairs
  ]
}
```

### Optional: Simple Template Table
```sql
CREATE TABLE idea_capture_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default template
INSERT INTO idea_capture_templates (name, description, questions, is_default)
VALUES (
  'Automation Audit',
  'Answer 6 questions to capture automation opportunities',
  '[
    {
      "id": "q1",
      "label": "What''s one task you personally do every single week that you absolutely shouldn''t?",
      "hint": "Think about tasks that feel repetitive or below your pay grade.",
      "type": "long_text"
    },
    // ... 5 more questions
  ]'::jsonb,
  true
);
```

---

## File Changes Summary

### Delete Entirely (Not Needed)
- `src/app/forms/[slug]/page.tsx`
- `src/app/forms/[slug]/thank-you/page.tsx`
- `src/app/api/forms/[slug]/route.ts`
- `src/app/api/forms/[slug]/submit/route.ts`
- `src/lib/ratelimit.ts`
- `src/lib/api/responses.ts`
- `src/lib/api/extraction.ts`
- `e2e/questionnaires.spec.ts` (public form tests)
- `docs/TESTING_QUESTIONNAIRES.md`

### Modify Significantly
- `src/components/forms/PublicQuestionnaireForm.tsx`
  → Rename to `src/components/ideas/GuidedCaptureForm.tsx`
  → Remove public/anonymous logic
  → Remove localStorage auto-save (not needed)
  → Remove preview mode
  → On submit: Create idea directly, redirect to idea detail

- `src/lib/api/questionnaires.ts`
  → Simplify to just read default template
  → Or delete if using hardcoded questions

- `supabase/migrations/20260107_questionnaires.sql`
  → Completely rewrite for simplified schema
  → Just add `metadata` column to `ideas`
  → Optional: `idea_capture_templates` table

### Create New
- `src/app/dashboard/ideas/capture/page.tsx`
- `src/components/ideas/GuidedCaptureForm.tsx`
- `src/app/api/ideas/create-from-capture/route.ts`

### Update Existing
- `src/app/dashboard/ideas/page.tsx` - Add "Guided Capture" button
- `src/app/dashboard/page.tsx` - Add audit card
- `src/types/database.ts` - Add `metadata` to ideas type

---

## New Implementation Plan

### Phase 1: Clean Up (2 hours)
1. Delete all public form files
2. Remove anonymous client code
3. Remove rate limiting
4. Update migration to simplified schema

### Phase 2: Build Internal Flow (4 hours)
1. Create `/dashboard/ideas/capture` page
2. Build `GuidedCaptureForm` component (multi-step)
3. Create API route: `POST /api/ideas/create-from-capture`
4. Update ideas page with "Guided Capture" button

### Phase 3: Integration (2 hours)
1. Add dashboard card for "Take Audit"
2. Create idea metadata parser (display Q&A nicely)
3. Test end-to-end flow
4. Write new E2E tests for internal flow

### Phase 4: Polish (2 hours)
1. Add success toast after idea creation
2. Show "View your new idea" link
3. Add badge for ideas from guided capture
4. Update documentation

**Total Effort**: ~10 hours (vs 3+ days already spent on wrong approach)

---

## Questions to Resolve

1. **Template Management**:
   - Hardcode 6 questions in component? (Simpler)
   - Store in database template table? (More flexible)
   - **Recommendation**: Start hardcoded, add DB later if needed

2. **Idea Title**:
   - Extract from first question answer? (e.g., "Manually updating spreadsheets")
   - Let user edit after creation?
   - **Recommendation**: Extract from Q1, let user edit in idea detail

3. **Idea Description**:
   - Concatenate all answers? (Verbose but complete)
   - AI-summarize answers? (Better but costs API call)
   - **Recommendation**: Concatenate with Q&A format, user can edit

4. **Entry Points**:
   - Just ideas page? Or dashboard too?
   - **Recommendation**: Both - dashboard card + ideas page button

5. **Multi-step vs Single Page**:
   - Multi-step wizard (one question at a time)?
   - Single page form (all questions visible)?
   - **Recommendation**: Multi-step (less overwhelming, feels guided)

---

## Salvageable Components

### Keep and Adapt
✅ **Question UI** from `PublicQuestionnaireForm.tsx`:
- Progress dots component
- Question card component
- Character count feedback
- Navigation buttons

✅ **Question Data** (the 6 questions are still valid):
- Question text
- Hints
- Placeholders

✅ **Types** from `src/types/questionnaire.ts`:
- `Question` interface
- Validation schemas (adapt for internal use)

### Discard
❌ Public form infrastructure
❌ Anonymous submission logic
❌ Rate limiting
❌ AI extraction (create ideas directly instead)
❌ Response-to-idea junction table

---

## New User Experience

### Before (Current, Wrong)
1. User shares public link with external person
2. External person fills form (no login)
3. Form owner gets email notification
4. Form owner manually triggers AI extraction
5. Ideas appear in form owner's dashboard
6. Form owner can evaluate ideas

### After (Corrected)
1. User in AutoFlow clicks "Guided Capture" on Ideas page
2. Multi-step form guides through 6 questions
3. Form submits → Idea created immediately
4. Redirect to idea detail slider
5. User can run AI evaluation right away
6. Idea shows badge "From Audit"

**Key Difference**: Same person asking and answering questions, no external users involved.

---

## Migration Path

### Option A: Hard Pivot (Recommended)
1. Delete all questionnaires code
2. Build new internal flow from scratch
3. Reuse UI components where applicable
4. Don't run existing migration (tables not needed)

### Option B: Incremental Adaptation
1. Keep questionnaires tables
2. Add internal flow alongside public flow
3. Eventually deprecate public flow
4. **Downside**: Complexity, maintaining unused code

**Recommendation**: Option A - clean slate, simpler codebase.

---

## Timeline

**If Starting Fresh**:
- Day 1: Clean up, build internal form component
- Day 2: API integration, idea creation flow
- Day 3: Testing, polish, deployment

**Total**: 3 days (vs 5+ days already spent on wrong approach)

---

## Apology & Next Steps

**What Happened**: I built a feature for external consultants sharing forms with clients, when you needed an internal tool for users to capture their own ideas.

**Why**: Misunderstood "questionnaire" as external form vs internal guided capture.

**Impact**: 34 files, 3,980 lines of unnecessary code for public access, anonymous submissions, AI extraction complexity.

**Next Steps**:
1. Confirm this pivot aligns with your vision
2. Choose Option A (hard pivot) or B (incremental)
3. Delete unnecessary code
4. Build simplified internal flow
5. Deploy corrected feature

**Timeline**: 3 days to course-correct vs weeks of maintaining wrong architecture.
