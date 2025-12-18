# Discovery Forms & Tools Registry — Specification

> **Target Version:** V2.0+
> **Status:** Deferred (focus on core pivot first)

---

## Discovery Forms

### Overview

Discovery Forms replace the current Questionnaire concept with a more flexible, reusable form builder that can attach responses directly to ideas as insights.

### Core Features

| Feature | Description |
|---------|-------------|
| Form Builder | Drag-and-drop question editor |
| Question Types | Text, long text, single choice, multiple choice, rating, date |
| Branching Logic | Show/hide questions based on previous answers |
| Public Links | Shareable URLs for external respondents |
| Branding | Custom logo, colours, intro text |
| Response Dashboard | View all submissions, filter, export |
| AI Analysis | Automatic extraction of ideas and insights from responses |

### Form → Idea Flow

```
Respondent submits form
    ↓
AI analyses responses
    ↓
Extract potential ideas (with scores)
    ↓
User reviews extracted ideas
    ↓
Accept → Creates idea with linked insights
```

### Response Fields Extracted by AI

| Field | Description |
|-------|-------------|
| Task Name | Identified automation opportunity |
| Frequency | Daily/Weekly/Monthly |
| Time Consumption | Hours estimate |
| Complexity | Low/Medium/High/Very High |
| Business Value | Impact score (1-10) |
| Suggested Solutions | Potential tools/approaches |

---

## Tools Registry

### Overview

A curated database of AI and automation tools that can be linked to ideas as potential solutions.

### Tool Record

| Field | Type | Description |
|-------|------|-------------|
| Name | text | Tool name (e.g., "Zapier", "n8n") |
| Category | enum | Integration, AI, No-Code, Custom, etc. |
| Description | text | What it does |
| Pricing Model | enum | Free, Freemium, Paid, Enterprise |
| Price Range | text | e.g., "$0-50/mo" |
| Use Cases | text[] | Common automation scenarios |
| Complexity | enum | Beginner, Intermediate, Advanced |
| Website | url | Official site |
| Logo | url | Tool icon |

### Tool → Idea Linking

- Ideas can have multiple suggested tools
- Tools ranked by fit (AI-suggested or manual)
- Track which tools are actually used (post-implementation)

### Categories

| Category | Examples |
|----------|----------|
| Integration Platforms | Zapier, Make, n8n, Tray.io |
| AI/ML | OpenAI, Claude, Hugging Face |
| No-Code Builders | Bubble, Webflow, Airtable |
| Document Automation | Pandadoc, DocuSign, Formstack |
| Data Processing | Fivetran, dbt, Airbyte |
| Communication | Slack, Discord, Twilio |
| Custom Development | Python, Node.js, serverless |

---

## Integration Points

### With Ideas

```typescript
interface Idea {
  // ... existing fields
  suggested_tools: ToolLink[];
  discovery_forms: FormLink[];
  insights: Insight[];
}

interface ToolLink {
  tool_id: string;
  fit_score: number;
  source: 'ai' | 'manual';
  status: 'suggested' | 'evaluating' | 'selected' | 'implemented';
}

interface FormLink {
  form_id: string;
  response_count: number;
  last_response_at: timestamp;
}

interface Insight {
  id: string;
  source: 'form_response' | 'manual' | 'imported';
  content: text;
  impact_rating: 'high' | 'medium' | 'low';
  customer_segment?: string;
  linked_idea_id: string;
}
```

### With Time Audit

- Forms can include time tracking questions
- Responses feed into Time Audit calculations
- Tools show estimated time savings

---

## UI Components (Future)

### Form Builder

- Question palette (drag to add)
- Question editor (settings, validation)
- Preview mode
- Publish settings (public link, password, expiry)

### Tools Browser

- Search and filter tools
- Category tabs
- Tool detail cards
- "Suggest for idea" action

### Response Dashboard

- Table of all responses
- Filter by form, date, status
- Bulk actions (export, analyse, create ideas)
- Individual response detail

---

## Implementation Notes

1. **Phase 7+** — After core pivot is stable
2. **Start with Tools Registry** — Static data, simpler to implement
3. **Forms require more infrastructure** — Custom form storage, response handling
4. **AI analysis reuses existing Claude integration**

---

## Questions to Answer Later

- [ ] Should forms be versioned? (edit without breaking live forms)
- [ ] Allow form embedding in external sites?
- [ ] Import tools from existing databases (G2, Capterra)?
- [ ] Tool comparison feature?
- [ ] Integration with actual tool APIs for status tracking?
