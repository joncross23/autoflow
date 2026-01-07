# Idea Capture Form/Agent - Implementation Plan

## Executive Summary

Build a **public-facing questionnaire system** that enables external stakeholders (clients/prospects) to submit structured discovery forms. An **AI assistant** guides completion, and **multi-idea extraction** creates discrete automation opportunities from each submission.

**Key Innovation:** Voice-first conversational assistant + intelligent extraction of N ideas from one submission

---

## User Requirements (Confirmed)

1. ✅ **Audience**: External stakeholders (clients/prospects submitting ideas)
2. ✅ **Interaction**: Web form with AI agent assistant + ability to create custom forms
3. ✅ **Integration**: Separate feature (not replacing QuickCapture) - different page/context
4. ✅ **Novel Features**:
   - Voice-first conversational mode
   - Extract multiple ideas from one submission

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              FORM BUILDER (Private)                     │
│  Template Manager → Question Builder → Share Link      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│            PUBLIC FORM (/f/[slug])                      │
│  Multi-step Wizard + AI Assistant + Voice Input         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           AI EXTRACTION ENGINE                          │
│  Analyse responses → Extract N discrete ideas           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              IDEAS TABLE (Existing)                     │
│  Links to submission, owned by form creator             │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema Additions

### New Tables

**1. `form_templates`** - Reusable questionnaire templates
```sql
- id, user_id, name, description, slug (URL-friendly)
- questions JSONB (array of question objects)
- settings JSONB (branding, notifications, AI config)
- is_public, is_active, submission_count
- created_at, updated_at
```

**2. `form_submissions`** - Public responses
```sql
- id, template_id, template_snapshot JSONB
- submitter_name, submitter_email, submitter_company
- responses JSONB (question_id → answer map)
- status (new, processing, extracted, archived)
- extracted_ideas_count, metadata JSONB
- created_at, processed_at
```

**3. `submission_ideas`** - Links submissions to extracted ideas
```sql
- submission_id, idea_id
- extraction_confidence (0.00-1.00)
- created_at
```

**4. `extraction_logs`** - AI debugging/analytics
```sql
- id, submission_id, model_version
- prompt_tokens, completion_tokens
- extracted_count, error_message
- created_at
```

### Key Design Decisions

**Versioning:** `template_snapshot` freezes questions at submission time (prevents breaking changes)

**RLS Policies:**
- Users see only their templates/submissions
- Public INSERT on submissions (no auth required)
- CASCADE deletes for GDPR compliance

---

## Component Structure

### Form Builder (Private `/dashboard/forms`)

```
/dashboard/forms/
  page.tsx                     → Template list
  new/page.tsx                 → Create template
  [id]/edit/page.tsx           → Edit template
  [id]/submissions/page.tsx    → View responses

/components/forms/builder/
  TemplateMetadataForm.tsx     → Name, description, slug
  QuestionBuilder.tsx          → Drag-drop question editor
  QuestionCard.tsx             → Edit individual question
  QuestionTypeSelector.tsx     → textarea, select, number, etc.
  SettingsPanel.tsx            → Branding, notifications, AI
  PreviewPanel.tsx             → Live preview of public form
```

### Public Form (No Auth `/f/[slug]`)

```
/app/f/[slug]/
  page.tsx                     → Public form container

/components/forms/public/
  PublicFormHeader.tsx         → Branding, title
  ProgressTracker.tsx          → "Question 3 of 6 (50%)"
  QuestionRenderer.tsx         → Single question per page
  AIAssistant.tsx              → Sidebar chat widget
  VoiceInput.tsx               → Web Speech API integration
  ContactFields.tsx            → Name, email, company (final step)
  FormNavigation.tsx           → Previous/Next buttons
  SubmissionSuccess.tsx        → Thank you page
```

### AI Assistant Widget

**Design:** Sticky sidebar (desktop), bottom sheet (mobile)

**States:**
- `idle` → Minimised, shows "Need help?"
- `listening` → Recording audio, waveform visualisation
- `thinking` → Processing transcript
- `suggesting` → Shows AI suggestion
- `error` → Permission denied / network error

**Features:**
- Big mic button for voice-first interaction
- Contextual help based on current question
- Auto-fill form field from voice transcript
- Memory of previous answers for context

---

## API Routes

### Template Management (Private, Auth Required)

```
GET    /api/forms/templates          → List templates
POST   /api/forms/templates          → Create template
GET    /api/forms/templates/[id]     → Get template details
PATCH  /api/forms/templates/[id]     → Update template
DELETE /api/forms/templates/[id]     → Archive template
```

### Public Form (No Auth)

```
GET  /api/forms/public/[slug]             → Get public form
POST /api/forms/public/[slug]/submit      → Submit responses
POST /api/forms/public/[slug]/ai-assist   → AI help (rate-limited)
```

### Extraction (Background Job)

```
POST /api/forms/submissions/[id]/extract  → Extract ideas
```

---

## AI Integration

### 1. AI Assistant (Contextual Help)

**Model:** Claude Haiku (fast, cheap for real-time feel)

**Prompt:**
```
You are guiding a user through an automation discovery form.

Question: {{question}}
Hint: {{hint}}
User's partial input: {{userInput}}
Previous answers: {{context}}

Help them provide a detailed, specific answer.
Be concise (1-2 sentences). Don't answer FOR them.
Encourage 20+ characters for good detail.
```

**Use Case:** User clicks AI assistant → speaks/types partial answer → gets contextual suggestion

### 2. Multi-Idea Extraction

**Model:** Claude Sonnet 4 (smart analysis required)

**Prompt:**
```
You are analysing a client's automation discovery questionnaire.

Submitter: {{name}} ({{company}})
Questions & Answers:
{{#each responses}}
Q: {{question}}
A: {{answer}}
{{/each}}

Extract DISCRETE automation opportunities.
For each opportunity:
- title: Action-oriented (5-10 words)
- description: Detailed (2-3 sentences)
- pain_points: What's broken now
- desired_outcome: What success looks like
- frequency: daily/weekly/monthly/etc.
- time_spent: Minutes per occurrence
- owner: Role mentioned in answers
- confidence: 0.0-1.0 (your confidence score)

Return JSON array. If no opportunities, return [].
```

**Output:** Creates N ideas in database, links to submission

---

## User Flows

### 1. Form Creator Flow

```
1. Click "Create Form" → Name template, choose slug
2. Build questions → Drag-drop, configure validation
3. Configure settings → Branding, notifications, AI auto-extract
4. Save template → Test via preview
5. Activate → Get public URL (e.g., /f/automation-audit)
6. Share link with clients
```

### 2. Form Submitter Flow

```
1. Visit /f/automation-audit
2. See branded header, form description
3. AI Assistant minimised ("Need help?")
4. For each question:
   a. Read question + hint
   b. (Optional) Click AI → speak answer → review transcript → auto-fill
   c. Click "Next Question"
5. Progress tracker: "6 of 6 complete"
6. Contact details (name, email, company)
7. Submit → "Thank you" page
8. Receive confirmation email
```

### 3. Idea Extraction Flow

```
1. Submission saved (status: new)
2. If auto-extract enabled:
   a. Call AI extraction API
   b. Claude Sonnet 4 analyses all Q&A pairs
   c. Returns JSON array of ideas
3. For each idea:
   a. Create in ideas table (status: "new", owner: form creator)
   b. Link via submission_ideas table
   c. Store confidence score
4. Update submission (status: extracted, count: N)
5. Email form creator: "New submission → N ideas extracted"
6. Creator reviews in Ideas page
```

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1)
**Files:** `/supabase/migrations/20260108_*.sql`
- Create 4 new tables with RLS policies
- Add indexes for performance
- Database functions (increment submission count)

### Phase 2: API Layer (Week 1-2)
**Files:** `/src/lib/api/formTemplates.ts`, `formSubmissions.ts`, `formExtraction.ts`
- Template CRUD operations
- Submission operations
- Validation helpers (Zod schemas)
- Unit tests

### Phase 3: AI Extraction Engine (Week 2)
**Files:** `/src/lib/ai/extractIdeas.ts`, `/src/app/api/forms/submissions/[id]/extract/route.ts`
- Multi-idea extraction prompt
- Claude Sonnet 4 integration
- JSON parsing, validation
- Create ideas + link to submission

### Phase 4: Form Builder UI (Week 3)
**Files:** `/src/app/dashboard/forms/`, `/src/components/forms/builder/`
- Template list, create, edit
- Drag-drop question builder (dnd-kit)
- Settings panel (branding, AI config)
- Live preview

### Phase 5: Public Form UI (Week 4)
**Files:** `/src/app/f/[slug]/`, `/src/components/forms/public/`
- Multi-step wizard
- Progress tracker
- Form validation
- Contact fields, success page
- Responsive design

### Phase 6: AI Assistant Widget (Week 5)
**Files:** `/src/components/forms/assistant/`, `/src/hooks/useVoiceRecognition.ts`
- Voice recognition (Web Speech API)
- Real-time transcription
- AI contextual help (Claude Haiku)
- Auto-fill from voice
- Rate limiting

### Phase 7: Submissions Dashboard (Week 6)
**Files:** `/src/components/forms/submissions/`
- List submissions (table view)
- Detail modal, extracted ideas
- Manual trigger extraction
- Export CSV, GDPR delete

### Phase 8: Default Template (Week 6)
**Files:** `/supabase/migrations/20260115_seed_default_template.sql`
- Seed 6-question discovery form from mockup

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Voice Transcription** | Web Speech API | Free, real-time, browser-native. Good enough for MVP. |
| **AI Assistant Model** | Claude Haiku | Fast (<500ms), cheap, adequate for contextual help. |
| **AI Extraction Model** | Claude Sonnet 4 | Smart analysis required for multi-idea extraction. |
| **Form Versioning** | Snapshot at submission | Simple, meets requirement (immutable submissions). |
| **Rate Limiting** | 5 submissions/hour/IP | Prevent spam, protect AI costs. |

---

## Edge Cases & Considerations

### Extraction Edge Cases
- **0 ideas extracted:** Flag for manual review, notify creator
- **1 idea extracted:** Normal flow
- **10+ ideas extracted:** Group by theme, suggest batching
- **Low confidence (<0.7):** Mark ideas "Review needed"

### Privacy & GDPR
- Explicit consent checkbox before submission
- Data retention policy (30/60/90 days configurable)
- Right to deletion (cascade to extracted ideas)
- Optional IP address storage

### Rate Limiting
```
/api/forms/public/[slug]           → 60 req/min per IP
/api/forms/public/[slug]/submit    → 5 req/hour per IP
/api/forms/public/[slug]/ai-assist → 20 req/hour per IP
```

### Spam Prevention
- Honeypot field (hidden, should be empty)
- Email validation (syntax + disposable domain check)
- Optional reCAPTCHA

---

## Critical Files to Create/Modify

### Create (New Files)
1. **`/supabase/migrations/20260108_form_templates.sql`** - Core database schema
2. **`/src/lib/ai/extractIdeas.ts`** - Multi-idea extraction engine
3. **`/src/app/f/[slug]/page.tsx`** - Public form page (no auth)
4. **`/src/components/forms/builder/QuestionBuilder.tsx`** - Form builder UI
5. **`/src/lib/api/formSubmissions.ts`** - Submission API layer

### Modify (Existing Files)
- **`/src/types/database.ts`** - Add FormTemplate, FormSubmission types
- **`/docs/ARCHITECTURE.md`** - Document new form system

---

## Success Metrics

**Product:**
- Forms created per user: Target 2-3
- Submission completion rate: >30%
- Ideas per submission: Avg 3-5
- AI confidence score: Avg >0.75

**Technical:**
- Form load time: <2s
- Voice transcription latency: <500ms
- Extraction time: <30s
- API uptime: 99.5%

---

## Rollout Strategy

### MVP (Phases 1-5): Core Functionality - 4-5 weeks
- Form builder with basic questions
- Public form submission
- AI extraction (manual trigger)
- Submissions list

**Ship to:** Internal testing + 2-3 beta clients

### V1.1 (Phase 6): AI Assistant - +1 week
- Voice input
- Contextual suggestions
- Auto-fill from voice

**Ship to:** Public beta

### V1.2 (Phases 7-8): Polish - +1 week
- Default 6-question template
- Exports, GDPR compliance
- Analytics

**Ship to:** General availability

---

## Alignment with AutoFlow Patterns

**Following existing conventions:**
- All DB operations via `/src/lib/api/*` (like ideas.ts, evaluations.ts)
- Server components for data, client for interactivity
- British English for user-facing text
- TypeScript strict mode, no `any`
- shadcn/ui components (Card, Button, Input, etc.)
- Voice capture pattern from QuickCapture.tsx
- AI evaluation pattern from `/src/lib/ai/evaluate.ts`

**Coexistence with QuickCapture:**
- QuickCapture: Internal rapid idea capture (authenticated users)
- Forms: External structured discovery (public, no auth)
- Both create ideas in same `ideas` table
- Different source metadata field

---

## Next Steps After Approval

1. Create database migrations (Phase 1)
2. Build API layer with tests (Phase 2)
3. Implement AI extraction engine (Phase 3)
4. Build form builder UI (Phase 4)
5. Build public form UI (Phase 5)
6. Add AI assistant widget (Phase 6)
7. Build submissions dashboard (Phase 7)
8. Seed default template (Phase 8)

---

**Estimated Total Timeline:** 6-7 weeks for complete system (MVP in 4-5 weeks)

**Ready to proceed?** Approve this plan to begin implementation.
