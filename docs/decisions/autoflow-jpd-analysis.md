# AutoFlow vs Jira Product Discovery — Gap Analysis & Strategic Recommendations

> **Analysis Date:** December 2024  
> **Author:** Business Analyst / Product Owner Review  
> **Purpose:** Identify feature gaps, strategic pivots, and backlog additions inspired by JPD

---

## Executive Summary

Jira Product Discovery (JPD) is Atlassian's purpose-built tool for product discovery, launched in 2023. While AutoFlow and JPD serve similar markets (capturing and prioritising ideas before execution), they have different philosophies:

| Aspect | Jira Product Discovery | AutoFlow |
|--------|----------------------|----------|
| **Primary Focus** | Product ideation & roadmapping | AI & automation discovery |
| **Scoring** | Manual frameworks (RICE, custom) | AI-assisted automated scoring |
| **Target User** | Product managers | SMB founders, operations leaders |
| **Integration** | Deep Jira ecosystem | Standalone (v1) |
| **Unique Value** | Stakeholder alignment, views | Time audit generation, ROI tracking |

**Key Finding:** AutoFlow has unique strengths (AI evaluation, time audit generation, automation-focused questionnaires) but could significantly benefit from JPD's **insights system**, **prioritisation views**, and **stakeholder sharing** capabilities.

---

## Part 1: Feature Gap Analysis

### 🟢 AutoFlow Strengths (Keep & Enhance)

| Feature | AutoFlow | JPD | Assessment |
|---------|----------|-----|------------|
| **AI-Automated Scoring** | ✅ Claude API evaluation | ❌ Manual scoring only | **Competitive advantage** — enhance, don't remove |
| **Time Audit Generation** | ✅ Automated reports | ❌ Not available | **Unique differentiator** — critical for SMB ROI |
| **Questionnaire Templates** | ✅ Editable, duplicable, public | ⚠️ No native forms | **Key strength** — JPD requires integrations |
| **Automation-Focused Analysis** | ✅ "Should this be automated?" | ❌ General product focus | **Niche positioning** — doubles down on use case |
| **Voice Capture (PWA)** | ✅ Planned | ❌ Not available | **Mobile-first innovation** |

### 🟡 Partial Coverage (Enhance)

| Feature | AutoFlow Current | JPD Capability | Gap Assessment |
|---------|-----------------|----------------|----------------|
| **Multiple Views** | Kanban + Table | List + Matrix + Board + Timeline | **Add Matrix view** for prioritisation |
| **Custom Fields** | Text, number, dropdown, date | Same + formula fields | **Add formula fields** for user-defined scoring |
| **Idea Workflow** | 5 statuses | Flexible columns | ✅ Adequate |
| **Public Sharing** | Questionnaires only | Published views + embedded | **Extend to boards/dashboards** |
| **Import/Export** | CSV/Excel planned | CSV/Excel + Jira + Slack | ✅ Adequate for v1 |

### 🔴 Missing Features (New Opportunities)

| JPD Feature | Description | Impact | Recommendation |
|-------------|-------------|--------|----------------|
| **Insights System** | Attach customer quotes, research, support tickets to ideas | High | **Add to backlog** |
| **Prioritisation Frameworks** | RICE, MoSCoW, Value vs Effort built-in | High | **Add to backlog** |
| **Impact Rating on Insights** | Weight insights (not all feedback is equal) | Medium | **Add to backlog** |
| **Matrix View** | X-Y plot for prioritisation discussions | High | **Add to backlog** |
| **Stakeholder Publishing** | Read-only views for leadership/customers | High | **Add to backlog** |
| **Idea Voting** | Contributors can vote without edit rights | Medium | **Add to backlog** |
| **Goals/OKR Linking** | Connect ideas to company objectives | Medium | **Add to backlog** (v2) |
| **Browser Extension** | Capture insights from any webpage | Low | **Add to backlog** (v2+) |
| **Customer Tagging** | Tag customers to ideas, segment scoring | Medium | **Add to backlog** (v2) |
| **Now/Next/Later Roadmap** | Time-agnostic commitment levels | High | **Incorporate into dashboard** |

---

## Part 2: Recommended Pivots

### Pivot 1: Introduce "Insights" as First-Class Concept

**Current State:** AutoFlow captures ideas and questionnaire responses separately.

**Recommendation:** Create an **Insights** system that:
- Attaches supporting evidence to ideas (quotes, links, tickets)
- Has impact ratings (High/Medium/Low)
- Shows insight count on idea cards
- Can influence AI scoring ("3 customer requests" = higher priority)

**Rationale:** JPD's killer feature is connecting customer voice to priorities. AutoFlow could do this better by combining AI analysis with human insights.

**Impact on Phases:**
- Phase 3 (Idea Capture) → Add insights panel
- Phase 6 (Questionnaires) → Responses become insights attached to ideas

---

### Pivot 2: Rename "AI Evaluation" to "Scoring System"

**Current State:** AI scoring is automatic and opaque.

**Recommendation:** Position as **Scoring System** that offers:
- **AI Score** (automatic, current approach)
- **RICE Score** (user inputs Reach, Impact, Confidence, Effort)
- **Custom Score** (user-defined formula fields)
- Weighted combination of multiple scoring methods

**Rationale:** Some users trust their own frameworks. Others want AI assistance. Offer both.

**New Scoring UI:**
```
┌─────────────────────────────────────┐
│ Scoring Method: [AI + RICE hybrid ▼]│
├─────────────────────────────────────┤
│ AI Score:     78/100  🤖            │
│ RICE Score:   1,200   📊            │
│ ────────────────────                │
│ Combined:     85      ⭐             │
└─────────────────────────────────────┘
```

---

### Pivot 3: Add Matrix View for Prioritisation Conversations

**Current State:** Kanban view focuses on execution workflow.

**Recommendation:** Add **Matrix View** specifically for prioritisation:
- X-axis: Effort (or any field)
- Y-axis: Impact (or any field)
- Circle size: Business value
- Quadrants: Quick Wins / Big Bets / Fill-ins / Avoid

**Rationale:** JPD's matrix view is their most praised feature for team alignment. It transforms subjective discussions into visual consensus.

**Impact on Phases:**
- Add to Phase 7 (Dashboards) or create new Phase 7.5
- Consider moving Timeline/Gantt here too

---

### Pivot 4: Stakeholder Portal

**Current State:** Sharing is limited to questionnaire links.

**Recommendation:** Create **Stakeholder Portal** with:
- Published read-only views of ideas, roadmaps, progress
- Configurable field visibility (hide internal scores)
- Embeddable in other tools (iframe)
- No login required for viewing

**Rationale:** SMB founders need to share progress with investors, advisors, board members. Current approach requires everyone to have accounts.

**Implementation:**
- Unique URLs with optional password protection
- View customisation (which fields to show)
- Export to PDF/image for presentations

---

### Pivot 5: Contributor Role Enhancement

**Current State:** Roles are Admin, Editor, Viewer.

**Recommendation:** Add **Contributor** role (like JPD):
- Can add insights to ideas
- Can vote on ideas
- Can comment
- Cannot edit core fields or create new ideas

**Rationale:** This unlocks feedback collection from broader team (sales, support) without giving them full access.

---

## Part 3: Recommended Backlog Additions

### High Priority (Phase 1-8 Integration)

| ID | Feature | Phase | Complexity | Business Value | Notes |
|----|---------|-------|------------|----------------|-------|
| **IDEA-021** | Insights system | Phase 3 | High | 9/10 | Attach evidence to ideas |
| **IDEA-022** | Matrix view (Impact vs Effort) | Phase 7 | Medium | 9/10 | Prioritisation visual |
| **IDEA-023** | Published read-only views | Phase 7 | Medium | 8/10 | Stakeholder sharing |
| **IDEA-024** | RICE scoring framework | Phase 4 | Medium | 8/10 | User-controlled scoring |
| **IDEA-025** | Idea voting | Phase 3 | Low | 7/10 | Team alignment |
| **IDEA-026** | Now/Next/Later roadmap | Phase 7 | Low | 8/10 | Time-agnostic planning |
| **IDEA-027** | Contributor role | Phase 2 | Low | 7/10 | Feedback collection |
| **IDEA-028** | Formula fields | Phase 5 | Medium | 7/10 | Custom scoring |

### Medium Priority (Post-MVP)

| ID | Feature | Complexity | Business Value | Notes |
|----|---------|------------|----------------|-------|
| **IDEA-029** | Goals/OKR linking | Medium | 8/10 | Strategic alignment |
| **IDEA-030** | Insight impact ratings | Low | 7/10 | Weighted feedback |
| **IDEA-031** | Customer tagging on ideas | Medium | 7/10 | Segment-based prioritisation |
| **IDEA-032** | Slack integration for insights | Medium | 6/10 | Capture from team channels |
| **IDEA-033** | Embeddable views (iframe) | Low | 6/10 | Third-party integration |

### Lower Priority (Future Consideration)

| ID | Feature | Complexity | Business Value | Notes |
|----|---------|------------|----------------|-------|
| **IDEA-034** | Browser extension | High | 5/10 | Web capture anywhere |
| **IDEA-035** | $10 voting game | Low | 5/10 | Gamified prioritisation |
| **IDEA-036** | Delivery progress tracking | Medium | 6/10 | Link to external tools |

---

## Part 4: Change Log (Recommended Project Updates)

### Updates to PROJECT_CONTEXT.md

```diff
### 3.6 Ideas Tracker

- List view (table) with sort/filter
- Card view (visual grid)
+ Matrix view (prioritisation X-Y plot)
- Status workflow: New → Evaluating → Prioritised → Converting → Archived
- AI scoring display
+ RICE scoring (optional)
+ Combined scoring (AI + manual frameworks)
+ Insight count per idea
+ Voting counts
- Bulk operations
- Convert to Project (one-click)

+ ### 3.7 Insights System (NEW)
+ 
+ #### Insight Types
+ - Customer quotes (from questionnaires, interviews)
+ - Support tickets (linked URLs)
+ - Research notes (freeform text)
+ - External links (articles, competitor analysis)
+ 
+ #### Insight Fields
+ | Field | Description |
+ |-------|-------------|
+ | Source | Where it came from (questionnaire, manual, Slack) |
+ | Impact Rating | High / Medium / Low |
+ | Customer Segment | Enterprise / SMB / Startup |
+ | Linked Idea | Which idea this supports |
+ 
+ #### Insight Features
+ - Bulk import from questionnaire responses
+ - Impact rating affects AI scoring boost
+ - Count displayed on idea cards

### 4. Authentication & Users

### In Scope (v1)
- Email/password authentication
- Magic link option
- MFA (TOTP, authenticator app)
- Multiple user accounts
- User roles: Admin, Editor, Viewer
+ - Contributor role (insights + voting only)
- Profile management
- Session management

### 3.4 Dashboards

#### Main Dashboard
- Quick Capture input (always visible)
- Ideas Pipeline (counts by status)
+ - Now/Next/Later Roadmap widget
- Active Projects (progress cards)
- Completed Projects (period stats)
- Total Impact (hours saved, £ value)
- Recent Activity feed

+ #### Stakeholder Portal
+ - Published read-only views (unique URLs)
+ - Configurable field visibility
+ - Password protection (optional)
+ - Export to PDF/image

### 6. Development Phases

### Phase 4: AI Evaluation
- [ ] Claude API integration
- [ ] Scoring prompts
+ [ ] RICE framework (manual scoring option)
+ [ ] Combined scoring modes
- [ ] Evaluation display
- [ ] Solution suggestions

### Phase 7: Dashboards
- [ ] Main dashboard
- [ ] Portfolio views
+ [ ] Matrix view (Impact vs Effort)
+ [ ] Now/Next/Later roadmap view
+ [ ] Stakeholder portal (published views)
- [ ] Time audit generation
- [ ] Analytics charts
- [ ] Exports
```

### Updates to CURRENT_STATE.md (Session Log)

```diff
## Next Phase: Authentication

Phase 2 will implement user authentication with Supabase:

| Task | Priority | Description |
|------|----------|-------------|
| Set up Supabase client | High | Configure auth client and middleware |
| Create auth pages | High | Login, register, forgot password |
| Implement protected routes | High | Middleware for dashboard routes |
| User profile management | Medium | View/edit profile settings |
| Session handling | Medium | Refresh tokens, logout |
+ | Contributor role | Medium | New role with limited permissions |
| Social auth (optional) | Low | Google, GitHub providers |
```

---

## Part 5: Strategic Recommendations

### 1. Don't Abandon AI — Enhance It

JPD's manual scoring works, but AutoFlow's AI advantage is real. The recommendation is to offer **AI-assisted scoring as a differentiator** while also supporting manual frameworks for users who prefer them.

**Positioning:** "AutoFlow is like Jira Product Discovery, but with AI that does the scoring for you."

### 2. Focus on SMB, Not Enterprise

JPD targets product teams in larger organisations (integrates with Jira, Confluence, Atlas). AutoFlow should target:
- Solo founders
- Small teams (< 20 people)
- Operations leaders without dedicated PMs

**Implication:** Keep the UI simple, avoid enterprise complexity.

### 3. Questionnaires Are Your Moat

JPD has no native form builder. AutoFlow's questionnaire system with AI analysis is unique. Double down on this:
- More templates (not just automation audit)
- Industry-specific questionnaires
- Questionnaire marketplace (share templates)

### 4. Time Audit Is Your Secret Weapon

No competitor generates time audits. This is AutoFlow's **killer feature** for ROI conversations. Make it more prominent:
- Dashboard widget showing "Recoverable hours this week"
- One-click time audit from any filtered view
- Comparison reports (before/after automation)

---

## Part 6: Updated Backlog Summary

### Combined Ideas Backlog (Original + JPD-Inspired)

| ID | Title | Source | Priority | Phase |
|----|-------|--------|----------|-------|
| IDEA-021 | Insights system | JPD Analysis | P1 | 3 |
| IDEA-022 | Matrix view | JPD Analysis | P1 | 7 |
| IDEA-023 | Published read-only views | JPD Analysis | P1 | 7 |
| IDEA-024 | RICE scoring framework | JPD Analysis | P1 | 4 |
| IDEA-025 | Idea voting | JPD Analysis | P1 | 3 |
| IDEA-026 | Now/Next/Later roadmap | JPD Analysis | P1 | 7 |
| IDEA-027 | Contributor role | JPD Analysis | P1 | 2 |
| IDEA-028 | Formula fields | JPD Analysis | P2 | 5 |
| IDEA-018 | Post-implementation ROI tracking | Original | P1 | 7 |
| IDEA-011 | AI conversation interface | Original | P1 | 4 |
| IDEA-006 | Time tracking on cards | Original | P2 | 5 |
| IDEA-005 | Card dependencies | Original | P2 | 5 |
| IDEA-003 | Public read-only board sharing | Original | P2 | 7 |
| IDEA-029 | Goals/OKR linking | JPD Analysis | P2 | 8 |
| IDEA-030 | Insight impact ratings | JPD Analysis | P2 | 3 |
| IDEA-013 | Calendar view | Original | P3 | 8 |
| IDEA-014 | Timeline/Gantt view | Original | P3 | 8 |
| IDEA-007 | Recurring cards | Original | P3 | 8 |
| IDEA-020 | Automation rules engine | Original | P3 | 8+ |

---

## Appendix: JPD Feature-by-Feature Mapping

| JPD Feature | AutoFlow Equivalent | Gap? |
|-------------|---------------------|------|
| Ideas | Ideas ✅ | No |
| Insights | (none) | **Yes** |
| Fields | Custom fields ✅ | No |
| Formula fields | (none) | **Yes** |
| RICE scoring | AI scoring (different approach) | Partial |
| List view | Table view ✅ | No |
| Matrix view | (none) | **Yes** |
| Board view | Kanban ✅ | No |
| Timeline view | Gantt (future) | Planned |
| Published views | Questionnaire links only | **Yes** |
| Chrome extension | (none) | **Yes** (low priority) |
| Slack integration | (none) | **Yes** (low priority) |
| Jira integration | N/A (standalone) | N/A |
| Confluence embed | (none) | **Yes** (low priority) |
| Creator/Contributor roles | Admin/Editor/Viewer | Partial |
| Goals linking | (none) | **Yes** |
| Delivery progress | Idea → Project conversion | Partial |

---

*End of Analysis*
