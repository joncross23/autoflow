# AutoFlow — Next Steps & Backlog

> **Last Updated:** 2024-12-16  
> **Current Phase:** 0.5 — Design Sprint  
> **Next Phase:** 0 — Foundation (pending stakeholder approval)

---

## Immediate Actions (This Week)

### Priority 1: Mockup Polish
- [ ] **Column name editing** — Add inline edit when clicking column title
- [ ] **Avatar enhancements** — Add tooltip on hover, improve stacking (-8px margins)
- [ ] **Progress field** — Add optional manual override to card data structure
- [ ] **Mobile testing** — Review all views at 375px, 768px breakpoints

### Priority 2: Stakeholder Review
- [ ] Present v4 prototype for feedback
- [ ] Document any requested changes
- [ ] Get sign-off to proceed to Phase 0

---

## Design Sprint Backlog (Phase 0.5)

### ✅ Completed
| ID | Task | Status |
|----|------|--------|
| DS-001 | Theme system (dark/light/6 accents) | ✅ Done |
| DS-002 | Dashboard mockup | ✅ Done |
| DS-003 | Ideas tracker (table + card views) | ✅ Done |
| DS-004 | Kanban board with drag-drop | ✅ Done |
| DS-005 | Card detail modal | ✅ Done |
| DS-006 | Questionnaire form preview | ✅ Done |
| DS-007 | Unified labels system | ✅ Done |
| DS-008 | AI Analysis panel | ✅ Done |
| DS-009 | Quick Add Card form | ✅ Done |
| DS-010 | Collapsible sidebar | ✅ Done |

### 🔄 In Progress
| ID | Task | Status | Notes |
|----|------|--------|-------|
| DS-011 | Column name editing | 🔄 Logged | Need inline edit |
| DS-012 | Avatar tooltips | 🔄 Logged | Show name on hover |
| DS-013 | Mobile responsive polish | 🔄 Partial | Needs testing |

### 📋 Remaining
| ID | Task | Priority |
|----|------|----------|
| DS-014 | Add Column functionality | Medium |
| DS-015 | Delete Column functionality | Medium |
| DS-016 | Card cover images/colours | Low |
| DS-017 | Custom fields UI | Low |
| DS-018 | Keyboard shortcuts panel (?) | Low |

---

## Foundation Backlog (Phase 0)

_To begin after Design Sprint approval_

| ID | Task | Priority | Est. Hours |
|----|------|----------|------------|
| F-001 | Initialize Next.js 14+ with App Router | High | 2 |
| F-002 | Configure TypeScript strict mode | High | 1 |
| F-003 | Set up Tailwind CSS | High | 1 |
| F-004 | Initialize shadcn/ui | High | 2 |
| F-005 | Create Supabase project | High | 2 |
| F-006 | Set up GitHub Actions CI/CD | Medium | 4 |
| F-007 | Configure ESLint + Prettier | Medium | 1 |
| F-008 | Create folder structure | Medium | 1 |
| F-009 | Set up Vitest | Medium | 2 |
| F-010 | Import design tokens from v4 | High | 4 |

---

## Full Development Backlog (Phases 1-8)

### Phase 1: Theme Implementation
| ID | Task | Priority |
|----|------|----------|
| T-001 | Port CSS custom properties to Tailwind config | High |
| T-002 | Create ThemeProvider component | High |
| T-003 | Build theme toggle component | High |
| T-004 | Create colour theme selector | High |
| T-005 | Persist preferences to localStorage | Medium |
| T-006 | Add system preference detection | Medium |

### Phase 2: Authentication
| ID | Task | Priority |
|----|------|----------|
| A-001 | Configure Supabase Auth | High |
| A-002 | Build registration flow | High |
| A-003 | Build login flow | High |
| A-004 | Implement magic links | Medium |
| A-005 | Add MFA (TOTP) support | Medium |
| A-006 | Create protected routes | High |
| A-007 | Build user profile page | Medium |

### Phase 3: Idea Capture
| ID | Task | Priority |
|----|------|----------|
| I-001 | Build Quick Capture component | High |
| I-002 | Implement Cmd/Ctrl+K shortcut | High |
| I-003 | Create Ideas list (table view) | High |
| I-004 | Create Ideas grid (card view) | High |
| I-005 | Add idea CRUD operations | High |
| I-006 | Implement auto-save drafts | Medium |
| I-007 | Add offline capture + sync | Low |

### Phase 4: AI Evaluation
| ID | Task | Priority |
|----|------|----------|
| AI-001 | Set up Claude API integration | High |
| AI-002 | Design scoring prompts | High |
| AI-003 | Build evaluation display UI | High |
| AI-004 | Add solution suggestions | Medium |
| AI-005 | Implement streaming responses | Low |

### Phase 5: Kanban Board
| ID | Task | Priority |
|----|------|----------|
| K-001 | Create board data structure | High |
| K-002 | Integrate dnd-kit | High |
| K-003 | Build column components | High |
| K-004 | Build card components | High |
| K-005 | Implement card detail modal | High |
| K-006 | Add all card features | High |
| K-007 | Build table view | Medium |
| K-008 | Idea → Project conversion | High |

### Phase 6: Questionnaires
| ID | Task | Priority |
|----|------|----------|
| Q-001 | Create template data model | High |
| Q-002 | Build template editor | High |
| Q-003 | Implement duplication | Medium |
| Q-004 | Create public form renderer | High |
| Q-005 | Build response collection | High |
| Q-006 | Add AI response analysis | Medium |

### Phase 7: Dashboards
| ID | Task | Priority |
|----|------|----------|
| D-001 | Build main dashboard | High |
| D-002 | Create portfolio view | Medium |
| D-003 | Implement time audit generation | High |
| D-004 | Add analytics charts | Medium |
| D-005 | Build export functionality | Medium |

### Phase 8: Polish & PWA
| ID | Task | Priority |
|----|------|----------|
| P-001 | Add service worker | Medium |
| P-002 | Implement voice capture | Low |
| P-003 | Build version history | Medium |
| P-004 | Add bulk operations | Medium |
| P-005 | Performance optimization | High |
| P-006 | Accessibility audit | High |

---

## Ideas Backlog (Future Considerations)

_From ideas.json — not committed to any phase_

| ID | Idea | Complexity | Value |
|----|------|------------|-------|
| IDEA-001 | Keyboard shortcuts panel | Low | 6 |
| IDEA-002 | Activity digest emails | Medium | 7 |
| IDEA-003 | Public read-only board sharing | Medium | 7 |
| IDEA-004 | Board duplication | Medium | 6 |
| IDEA-005 | Card dependencies (blocked by) | High | 7 |
| IDEA-006 | Time tracking on cards | Medium | 8 |
| IDEA-007 | Recurring cards | Medium | 7 |
| IDEA-011 | AI conversation interface | High | 9 |
| IDEA-013 | Calendar view for cards | High | 7 |
| IDEA-014 | Timeline/Gantt view | Very High | 7 |
| IDEA-018 | Post-implementation ROI tracking | Medium | 9 |

---

## Architectural Decisions Log

| Date | Decision | Status |
|------|----------|--------|
| 2024-12-16 | Keep unified ID-based label system | ✅ Approved |
| 2024-12-16 | Add optional progress field override | ✅ Approved |
| 2024-12-16 | Enhance Avatar with tooltip + stacking | ✅ Approved |
| 2024-12-16 | Dark mode as default | ✅ Approved |
| 2024-12-16 | dnd-kit for drag-drop | ✅ Approved |
| 2024-12-16 | No multi-tenancy in v1 | ✅ Approved |

---

## Files to Commit

```
docs/
├── CURRENT_STATE.md      ← This session's progress
├── NEXT_STEPS.md         ← This file (backlog)
├── PROJECT_CONTEXT.md    ← Full specification (existing)
├── mockups/
│   └── autoflow-prototype-v4.jsx
└── backlog/
    ├── project.json      ← Existing
    └── ideas.json        ← Existing
```
