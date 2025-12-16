# AutoFlow — Current State

> **Repository:** https://github.com/jon-cross/autoflow  
> **Vercel:** Linked to GitHub ✔  
> **Supabase:** Linked to GitHub ✔  
> **Last Updated:** 2024-12-16  
> **Current Phase:** 0.5 — Design Sprint  
> **Next Session Focus:** Card detail modal mockup

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
- [x] **Theme system mockup** (dark mode, colour selector)
- [x] **Kanban board mockup** (drag-drop UX)

### In Progress
- [ ] Card detail modal mockup
- [ ] Dashboard mockup

### Blocked
_None currently_

---

## Current Phase: 0.5 — Design Sprint

**Objective:** Create interactive mockups for stakeholder QA and acceptance before infrastructure investment.

**Deliverables:**
| Mockup | Status | Notes |
|--------|--------|-------|
| Theme system + colour selector | ✅ Done | 6 accent themes, dark/light/system |
| Kanban board | ✅ Done | Trello-style drag-drop UX |
| Card detail modal | Not started | Next priority |
| Main dashboard | Not started | |
| Questionnaire form (public) | Not started | |
| Mobile responsive views | Not started | |

**Acceptance Criteria:**
- [x] All mockups render in dark mode by default
- [x] Theme toggle works (dark/light/system)
- [x] Colour theme selector functional
- [x] Drag-drop has clear visual feedback
- [ ] Mobile layouts demonstrated
- [ ] Stakeholder sign-off obtained

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

---

## Design Tokens Established

### Mode Colours
```
Dark Mode:
  --bg: #0A0A0B
  --bg-secondary: #131316
  --bg-tertiary: #1A1A1F
  --bg-elevated: #1F1F26
  --text: #FAFAFA
  --text-secondary: #A1A1AA
  --text-muted: #71717A

Light Mode:
  --bg: #FAFAFA
  --bg-secondary: #F4F4F5
  --bg-tertiary: #E4E4E7
  --bg-elevated: #FFFFFF
  --text: #09090B
```

### Accent Themes
```
Midnight Blue: #3B82F6 / #1E3A5F
Emerald Green: #10B981 / #064E3B
Sunset Orange: #F59E0B / #78350F
Royal Purple:  #8B5CF6 / #4C1D95
Rose Pink:     #EC4899 / #831843
Slate Grey:    #64748B / #1E293B
```

### Accessibility Rule
> Text on `--primary-muted` or `--primary` backgrounds must use explicit white (`#FFFFFF` or `rgba(255,255,255,x)`), never `var(--text)`.

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

## Next Session Checklist

### Continue Design Sprint:
- [ ] Create card detail modal mockup with:
  - Title with inline edit
  - Rich description editor
  - Labels selector
  - Checklists with paste-to-create
  - Due date picker
  - Member assignment
  - Attachments section
  - Comments thread
  - Activity log
  - AI Analysis button/panel
- [ ] Create dashboard mockup (expand from theme system preview)
- [ ] Get stakeholder feedback on all mockups

### When ready for Phase 0:
- [ ] Confirm mockups approved
- [ ] Initialise Next.js project
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up Supabase project
- [ ] Create CI/CD pipeline
- [ ] Extract design tokens from mockups

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

**Artifacts Created:**
- `CLAUDE.md` — Claude Code root instructions
- `PROJECT_INSTRUCTIONS.md` — Claude Project settings
- `docs/PROJECT_CONTEXT.md` — Full specification
- `docs/CURRENT_STATE.md` — This file
- `docs/backlog/*.json` — Backlog structure

---

### 2024-12-16 — Theme System & Kanban Mockups
**Participants:** Jon (stakeholder), Claude

**Accomplished:**
- Created interactive theme system mockup:
  - Dark/Light/System mode toggle
  - 6 accent colour themes with CSS variables
  - Dashboard preview showing theme applied to UI
  - CSS custom properties architecture documented
- Created Kanban board mockup:
  - Full drag-drop functionality
  - Card-sized drop placeholders (Trello-style)
  - Column reordering
  - Subtle, professional animations
  - Labels, progress bars, avatars, due dates
- Refined accessibility (contrast on accent backgrounds)
- Refined animations (subtle rotation, soft shadows)

**Artifacts Created:**
- `docs/mockups/README.md` — Mockups documentation
- `docs/mockups/theme-system.jsx` — Theme mockup
- `docs/mockups/kanban-board.jsx` — Kanban mockup

**Feedback Incorporated:**
- Fixed text contrast on accent-coloured backgrounds
- Removed jarring column hover effects
- Made drag animations more subtle (1.5° vs 3°)
- Changed insertion indicator to card-sized placeholder
- Disabled card hover effects during drag operations
- Fixed column header menu button layout shift

**Next Steps:**
1. Card detail modal mockup
2. Full dashboard mockup
3. Questionnaire form mockup
4. Mobile responsive views
5. Stakeholder sign-off → Phase 0
