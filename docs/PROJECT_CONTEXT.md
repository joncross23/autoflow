# AutoFlow — Full Project Context

> This document contains the complete specification for AutoFlow. It is the authoritative source for both Claude Project (web) and Claude Code (CLI).

---

## 1. Project Overview

**AutoFlow** is a web application designed to accelerate businesses through the complete lifecycle of AI and automation adoption:

1. **Capture** — Rapid idea collection (text, voice, forms)
2. **Evaluate** — AI-assisted scoring and prioritisation
3. **Execute** — Structured project tracking with Trello-style boards
4. **Measure** — ROI tracking and time audit generation

### Target Users
- SMB founders
- Operations leaders
- Digital transformation teams

### Core Philosophy
"Capture Fast. Evaluate Deep. Execute Systematically."

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| AI | Anthropic Claude API |
| Styling | Tailwind CSS + shadcn/ui |
| Drag & Drop | dnd-kit |
| Animation | Framer Motion |
| Deployment | Vercel |
| Testing | Vitest + React Testing Library + Playwright |

---

## 3. Feature Specifications

### 3.1 Idea Capture

#### Quick Capture
- Single-field rapid entry (title only)
- Keyboard shortcut: `Cmd/Ctrl + K`
- Press Enter to submit instantly
- Voice-to-text (mobile PWA)
- Auto-save drafts

#### Structured Capture
- Guided form with fields:
  - Task name
  - Current owner/role
  - Frequency (daily/weekly/monthly)
  - Time spent per occurrence
  - Pain points
  - Desired outcome
- AI-assisted field suggestions
- Auto-tagging
- Duplicate detection

### 3.2 Questionnaire Forms

**Critical:** Templates must be editable and duplicable.

#### Template Management
- Create from scratch
- Duplicate existing template
- Edit questions, order, styling
- Version history
- Archive old versions

#### Default AI & Automation Audit Template
```
1. What's one task you personally do every single week that you absolutely shouldn't, but it has to get done?

2. Describe one process in your business that's a bit of a mess right now.

3. On a typical week, how many hours do YOU personally spend on things that aren't revenue-generating or strategic?

4. If you had an extra 20 hours per week back, what would you actually do with it? Be specific.

5. What's the most annoying handoff between team members or systems?

6. Which reports or updates do you create manually that feel like they should be automatic?
```

#### Form Features
- Shareable public links (no login to submit)
- Custom branding
- Response dashboard
- AI analysis of responses
- Export to CSV/Excel
- Notifications on submission

#### AI Response Analysis
Extracts from each submission:

| Field | Description |
|-------|-------------|
| Task Name | Identified task |
| Frequency | Daily/Weekly/Monthly |
| Time Consumption | Hours estimate |
| Complexity | Low/Medium/High/Very High |
| Value | Business impact (1-10) |
| Costs | Current cost estimate |

Generates:

| Output | Description |
|--------|-------------|
| Rank | Priority position |
| Reasons for Automation | Justification |
| Potential Solutions | Suggested tools/approaches |

### 3.3 Project Tracker (Kanban)

#### Card Features

| Feature | Description |
|---------|-------------|
| Name | Inline quick-edit |
| Description | Rich text, markdown support |
| Labels | Coloured tags, customisable per board |
| Checklists | Multiple per card |
| Checklist Quick-Add | Paste multi-line text → separate items |
| Checklist Item Dates | Due dates on individual items |
| Due Date | Card-level with reminders |
| Start Date | For duration tracking |
| Attachments | Images, files, documents |
| Links | URLs with previews |
| AI Analysis | On-demand evaluation |
| Comments | Threaded discussion |
| Activity Log | Change history |
| Members | Assignees with avatars |
| Card Cover | Image or colour |
| Custom Fields | Text, number, dropdown, checkbox, date |
| Watch | Subscribe to notifications |
| Archive | Soft delete with restore |
| Card Templates | Save as template |
| Copy/Move | Between boards |

#### Column Features

| Feature | Description |
|---------|-------------|
| Draggable | Reorder via drag-and-drop |
| Colour Header | Customisable background |
| Collapse | Minimise to save space |
| WIP Limits | Optional card limits |
| Add Card | Quick-add top or bottom |
| Sort Cards | By date, name, custom field |
| Bulk Actions | Move/copy all cards |

#### Drag-and-Drop UX (CRITICAL)

- Smooth 60fps animations
- Clear visual drop zones
- Ghost card preview while dragging
- Precise positioning between cards
- Visual insertion line indicator
- Animated reflow on drop
- Touch-friendly for mobile
- Keyboard accessible

#### Board Views

| View | Description |
|------|-------------|
| Kanban | Default column-based |
| Table | Sortable spreadsheet list |
| Timeline | Gantt by dates (future) |
| Calendar | Cards by due date (future) |

### 3.4 Dashboards

#### Main Dashboard
- Quick Capture input (always visible)
- Ideas Pipeline (counts by status)
- Active Projects (progress cards)
- Completed Projects (period stats)
- Total Impact (hours saved, £ value)
- Recent Activity feed

#### Portfolio View
- All projects: card or table format
- Filter by status, tag, date
- Sort by impact, progress, date

#### Analytics
- Time saved trends
- ROI: projected vs actual
- Adoption velocity
- Conversion funnel

### 3.5 Time Audit Generation

Auto-generate sheets matching format:

| Column | Description |
|--------|-------------|
| Area | Task grouping |
| Current Hours/Week | Time now |
| Who Does It | Role/person |
| Hourly Rate | £ cost |
| AI/Automation Save | Hours saved |
| Weekly £ Value | Rate × hours |
| Annual Impact | Weekly × 52 |

**Footer:** Totals + "Hidden Capacity Costs"

**Export:** Excel, PDF, CSV

### 3.6 Ideas Tracker

- List view (table) with sort/filter
- Card view (visual grid)
- Status workflow: New → Evaluating → Prioritised → Converting → Archived
- AI scoring display
- Bulk operations
- Convert to Project (one-click)

---

## 4. Authentication & Users

### In Scope (v1)
- Email/password authentication
- Magic link option
- MFA (TOTP, authenticator app)
- Multiple user accounts
- User roles: Admin, Editor, Viewer
- Profile management
- Session management

### Out of Scope (v1)
- Multi-tenancy / organisation isolation
- Team workspaces
- SSO/SAML

---

## 5. App-Wide Features

### Theme System

**Default:** Dark mode

**Toggle:** Dark | Light | System

**Colour Themes (Accent):**
- Midnight Blue (default)
- Emerald Green
- Sunset Orange
- Royal Purple
- Rose Pink
- Slate Grey

### Offline (PWA)
- Service worker
- Offline idea capture
- Sync queue
- "Offline" indicator

### Version History
- Track changes to ideas/projects
- View previous versions
- Restore any version
- Audit trail

### Bulk Operations
- Import from spreadsheet (CSV, Excel)
- Bulk status changes
- Mass archiving
- Multi-select (Shift+Click)

### Data & Compliance
- GDPR export (JSON/CSV)
- Supabase backups
- Soft deletes (30-day retention)
- Hard delete on request

---

## 6. Development Phases

### Phase 0.5: Design Sprint ← CURRENT
- [ ] Theme system mockup
- [ ] Colour selector mockup
- [ ] Dashboard mockup
- [ ] Kanban board mockup
- [ ] Card modal mockup
- [ ] Questionnaire mockup
- [ ] Mobile views
- [ ] **Stakeholder sign-off**

### Phase 0: Foundation
- [ ] Git repository with structure
- [ ] Next.js + Tailwind + shadcn/ui
- [ ] Supabase project
- [ ] CI/CD pipeline
- [ ] Documentation structure
- [ ] Backlog JSON import ready

### Phase 1: Theme Implementation
- [ ] Design tokens in code
- [ ] Dark mode default
- [ ] Light mode + toggle
- [ ] Colour theme selector
- [ ] Component library

### Phase 2: Authentication
- [ ] Supabase Auth
- [ ] MFA setup
- [ ] Registration/login
- [ ] Protected routes
- [ ] User profiles

### Phase 3: Idea Capture
- [ ] Quick capture
- [ ] Ideas list (table + card)
- [ ] CRUD operations
- [ ] Keyboard shortcuts
- [ ] Mobile capture
- [ ] Offline + sync

### Phase 4: AI Evaluation
- [ ] Claude API integration
- [ ] Scoring prompts
- [ ] Evaluation display
- [ ] Solution suggestions

### Phase 5: Kanban Board
- [ ] Board structure
- [ ] dnd-kit integration
- [ ] Card detail modal
- [ ] All card features
- [ ] Column customisation
- [ ] Table view
- [ ] Idea → Project conversion

### Phase 6: Questionnaires
- [ ] Template builder
- [ ] Duplication/versioning
- [ ] Public forms
- [ ] Response collection
- [ ] AI analysis

### Phase 7: Dashboards
- [ ] Main dashboard
- [ ] Portfolio views
- [ ] Time audit generation
- [ ] Analytics charts
- [ ] Exports

### Phase 8: Polish & PWA
- [ ] Service worker
- [ ] Voice capture
- [ ] Version history
- [ ] Bulk operations
- [ ] Performance
- [ ] Accessibility

---

## 7. Git & Documentation

### Repository Structure
```
autoflow/
├── CLAUDE.md
├── PROJECT_INSTRUCTIONS.md
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── CURRENT_STATE.md
│   ├── backlog/
│   ├── decisions/
│   ├── sprints/
│   └── mockups/
├── src/
├── tests/
└── public/
```

### Branching
```
main        → Production
develop     → Integration
feature/*   → Features
fix/*       → Bugs
docs/*      → Documentation
```

### Commits
Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`

---

## 8. Out of Scope (v1)

Explicitly excluded:
- Multi-tenancy
- Team workspaces
- Organisation isolation
- SSO/SAML
- Real-time collaboration
- Native mobile apps
- Third-party integrations
- Automation rules engine
- White-labelling

---

## 9. Success Metrics

### Product
- Ideas captured per user/week
- Idea → Project conversion rate
- Project completion rate

### Business Impact
- Hours saved (user-reported)
- £ value recovered
- ROI on automation projects

### Technical
- Test coverage: 85%+
- Lighthouse: 90+
- Core Web Vitals: Pass
