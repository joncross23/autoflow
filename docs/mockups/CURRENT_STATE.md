# AutoFlow — Current State

> **Repository:** https://github.com/jon-cross/autoflow  
> **Vercel:** Linked to GitHub ✔  
> **Supabase:** Linked to GitHub ✔  
> **Last Updated:** 2024-12-16  
> **Current Phase:** 0.5 — Design Sprint ✅ COMPLETE  
> **Next Phase:** 0 — Foundation (Infrastructure Setup)

---

## Progress Summary

### Completed
- [x] Initial project prompt created
- [x] Requirements refined with stakeholder input
- [x] Trello feature audit completed
- [x] Development phases defined
- [x] Backlog structure designed
- [x] Claude Project + Claude Code sync strategy established
- [x] Bootstrap files created
- [x] **Phase 0.5: All mockups created and accepted**

### Ready for Phase 0
- [ ] Initialise Next.js project
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up Supabase project
- [ ] Create CI/CD pipeline
- [ ] Extract design tokens from mockups

### Blocked
_None currently_

---

## Phase 0.5: Design Sprint — ✅ COMPLETE

**Objective:** Create interactive mockups for stakeholder QA and acceptance before infrastructure investment.

**Deliverables:**
| Mockup | Status | Notes |
|--------|--------|-------|
| Theme system + colour selector | ✅ Accepted | 6 accent themes, dark/light/system |
| Kanban board | ✅ Accepted | Trello-style drag-drop UX |
| Card detail modal | ✅ Accepted | Full card features, AI analysis |
| Main dashboard | ✅ Accepted | Quick capture, stats, activity feed |
| Questionnaire form (public) | ✅ Accepted | Progress indicator, branding |
| Mobile responsive views | ✅ Accepted | All views adapted for mobile |

**Acceptance Criteria:**
- [x] All mockups render in dark mode by default
- [x] Theme toggle works (dark/light/system)
- [x] Colour theme selector functional
- [x] Drag-drop has clear visual feedback
- [x] Mobile layouts demonstrated
- [x] **Stakeholder sign-off obtained** ✅

---

## Phase 0: Foundation — NEXT

**Objective:** Set up development infrastructure and extract design system from mockups.

**Tasks:**
| Task | Status | Notes |
|------|--------|-------|
| Next.js 14+ with App Router | Not started | TypeScript strict mode |
| Tailwind CSS + shadcn/ui | Not started | |
| Design tokens extraction | Not started | From mockup CSS variables |
| Supabase project setup | Not started | Auth + Database |
| CI/CD pipeline | Not started | GitHub Actions → Vercel |
| Component library scaffold | Not started | Based on mockup patterns |

---

## Design Tokens (from mockups)

### Mode Colours
```css
/* Dark Mode */
--bg: #0A0A0B;
--bg-secondary: #131316;
--bg-tertiary: #1A1A1F;
--bg-elevated: #1F1F26;
--border: #27272A;
--border-subtle: #1F1F23;
--text: #FAFAFA;
--text-secondary: #A1A1AA;
--text-muted: #71717A;

/* Light Mode */
--bg: #FAFAFA;
--bg-secondary: #F4F4F5;
--bg-tertiary: #E4E4E7;
--bg-elevated: #FFFFFF;
--border: #D4D4D8;
--border-subtle: #E4E4E7;
--text: #09090B;
--text-secondary: #52525B;
--text-muted: #A1A1AA;
```

### Accent Themes
| Theme | Primary | Muted |
|-------|---------|-------|
| Midnight Blue | `#3B82F6` | `#1E3A5F` |
| Emerald Green | `#10B981` | `#064E3B` |
| Sunset Orange | `#F59E0B` | `#78350F` |
| Royal Purple | `#8B5CF6` | `#4C1D95` |
| Rose Pink | `#EC4899` | `#831843` |
| Slate Grey | `#64748B` | `#1E293B` |

### Animation Timings
- Transitions: `0.12s ease-out`
- Card pickup: `rotate(1.5deg)`, shadow `0 8px 24px`
- Hover lift: `translateY(-1px)`

### Accessibility Rule
> Text on `--primary-muted` or `--primary` backgrounds must use explicit white (`#FFFFFF` or `rgba(255,255,255,x)`), never `var(--text)`.

---

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-16 | Mockups before infrastructure | Validate design before investment |
| 2024-12-16 | Dark mode as default | User preference, modern aesthetic |
| 2024-12-16 | Use dnd-kit for drag-drop | Best React DnD library, accessible |
| 2024-12-16 | No multi-tenancy in v1 | Keep scope manageable |
| 2024-12-16 | JSON backlog in repo | Self-documenting, becomes first import |
| 2024-12-16 | CSS custom properties for theming | Runtime theme switching without rebuild |
| 2024-12-16 | 3-level background hierarchy | bg → bg-secondary → bg-elevated for depth |
| 2024-12-16 | Subtle drag animations | 1.5° rotation, soft shadows — Trello-like |
| 2024-12-16 | Card-sized drop placeholders | Visual clarity for drop targets |
| 2024-12-16 | **All mockups accepted** | Ready to proceed to infrastructure |

---

## Open Questions

1. ~~**Repository:**~~ ✔ Created: jon-cross/autoflow
2. ~~**Hosting:**~~ ✔ Vercel linked to GitHub
3. ~~**Database:**~~ ✔ Supabase linked to GitHub
4. **Branding:** Logo, specific brand colours, typography preferences?
5. **Domain:** What domain will this deploy to?
6. **Analytics:** Vercel Analytics, PostHog, or other?
7. **Email provider:** For notifications — Resend, SendGrid?

---

## Mockup Files

All mockups in `docs/mockups/`:

| File | Description |
|------|-------------|
| `README.md` | How to view mockups, design tokens reference |
| `theme-system.jsx` | Theme toggle, accent colour picker |
| `kanban-board.jsx` | Drag-drop board with columns and cards |
| `card-detail-modal.jsx` | Full card editing, checklists, AI panel |
| `dashboard.jsx` | Main dashboard with all widgets |
| `questionnaire-form.jsx` | Public-facing form |
| `mobile-views.jsx` | Mobile-responsive layouts |

**To view:** Open in Claude and ask to render as artifact, or run in any React environment.

---

## Session Log

### 2024-12-16 — Initial Planning
**Participants:** Jon (stakeholder), Claude

**Accomplished:**
- Defined full project specification
- Established Trello feature parity requirements
- Designed phased development approach
- Created bootstrap files for Claude Project + Claude Code sync
- Decided to start with mockups before infrastructure

---

### 2024-12-16 — Phase 0.5 Design Sprint ✅
**Participants:** Jon (stakeholder), Claude

**Accomplished:**
- Created all 6 interactive mockups
- Iterated on accessibility (contrast fixes)
- Refined animations (subtle, Trello-like)
- Fixed drag-drop UX (card placeholders, no hover during drag)
- **All mockups accepted by stakeholder**

**Mockups Created:**
1. Theme system — dark/light/system, 6 accent colours
2. Kanban board — full drag-drop with Trello UX
3. Card detail modal — all card features, AI analysis
4. Dashboard — quick capture, stats, pipeline, activity
5. Questionnaire form — public form with progress
6. Mobile views — responsive adaptations

**Key Design Refinements:**
- Column header menu button doesn't cause layout jump
- Card hover disabled during drag operations
- Drop placeholder is card-sized (not just a line)
- Animations are subtle: 1.5° rotation, soft shadows
- All accent-background text uses explicit white

**Next Steps:**
1. Commit all mockups to Git
2. Begin Phase 0: Foundation
3. Extract design tokens to code
4. Set up Next.js + Tailwind + shadcn/ui
