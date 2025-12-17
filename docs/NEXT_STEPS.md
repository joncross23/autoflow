# AutoFlow — Next Steps

> **Last Updated:** 2024-12-17
> **Current Phase:** 0.5 Complete | **Next Phase:** 0 — Foundation
> **Status:** Ready for Implementation

---

## Immediate Priority: Phase 0 — Foundation

Now that mockups are approved, establish the development infrastructure.

### Phase 0 Checklist

| # | Task | Priority | Description |
|---|------|----------|-------------|
| 1 | Initialize Next.js 14+ | **Critical** | App Router, TypeScript strict mode |
| 2 | Configure Tailwind CSS | **Critical** | With design tokens from prototype |
| 3 | Install shadcn/ui | **Critical** | Component library foundation |
| 4 | Set up Supabase project | **Critical** | Database, auth, realtime |
| 5 | Create folder structure | High | `/src/app`, `/src/components`, `/src/lib`, etc. |
| 6 | Configure ESLint + Prettier | High | Code quality standards |
| 7 | Set up Vitest | Medium | Testing framework |
| 8 | GitHub Actions CI/CD | Medium | Automated testing and deployment |
| 9 | Import design tokens | High | Port CSS custom properties to Tailwind config |
| 10 | Create ThemeProvider | High | Based on prototype pattern |

### Commands to Run
```bash
# In repository root
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install framer-motion lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Set up shadcn/ui
npx shadcn@latest init
```

---

## Development Phases Overview

### Phase 1: Theme Implementation
- Port design tokens to Tailwind config
- Create ThemeProvider with dark/light/system support
- Build theme toggle component
- Create colour theme selector (6 accents)
- Persist preferences to localStorage

### Phase 2: Authentication
- Configure Supabase Auth
- Build registration/login flows
- Implement magic links
- Add MFA (TOTP) support
- Create protected routes
- Build user profile page

### Phase 3: Idea Capture
- Build Quick Capture component (Cmd/Ctrl+K)
- Create Ideas list (table + card views)
- Add idea CRUD operations
- Implement auto-save drafts
- Add offline capture + sync (future)

### Phase 4: AI Evaluation
- Set up Claude API integration
- Design scoring prompts
- Build evaluation display UI
- Add solution suggestions
- Implement streaming responses

### Phase 5: Kanban Board
- Create board data structure
- Integrate dnd-kit (based on mockup patterns)
- Build column + card components
- Implement card detail modal
- Add all card features (labels, checklists, etc.)
- Build table view
- Idea-to-Project conversion flow

### Phase 6: Questionnaires
- Create template data model
- Build template editor
- Implement duplication
- Create public form renderer
- Build response collection
- Add AI response analysis

### Phase 7: Dashboards
- Build main dashboard (from mockup)
- Create portfolio view
- Implement time audit generation
- Add analytics charts
- Build export functionality (CSV, PDF)

### Phase 8: Polish & PWA
- Add service worker
- Implement voice capture
- Build version history
- Add bulk operations
- Performance optimization
- Accessibility audit

---

## Feature Backlog (Ideas)

These are logged but not committed to any phase:

| ID | Idea | Complexity | Value |
|----|------|------------|-------|
| IDEA-001 | Keyboard shortcuts panel | Low | 6/10 |
| IDEA-002 | Activity digest emails | Medium | 7/10 |
| IDEA-003 | Public read-only board sharing | Medium | 7/10 |
| IDEA-004 | Board duplication | Medium | 6/10 |
| IDEA-005 | Card dependencies (blocked by) | High | 7/10 |
| IDEA-006 | Time tracking on cards | Medium | 8/10 |
| IDEA-007 | Recurring cards | Medium | 7/10 |
| IDEA-011 | AI conversation interface | High | 9/10 |
| IDEA-013 | Calendar view for cards | High | 7/10 |
| IDEA-014 | Timeline/Gantt view | Very High | 7/10 |
| IDEA-018 | Post-implementation ROI tracking | Medium | 9/10 |

---

## Key Implementation Notes

### From Prototype v4.4

**Drag-Drop Behaviour (dnd-kit):**
- Card pickup: `rotate(1.5deg)`, shadow `0 8px 24px`
- Ghost card: `opacity: 0.4` at original position
- Drop placeholder: 60px dashed box with primary colour
- Animation timing: `0.12s ease-out`

**Theme System:**
- Default: Dark mode
- Options: Dark | Light | System
- System mode: Uses `prefers-color-scheme` media query
- 6 accent colours selectable in Settings

**Mobile Responsive:**
- Breakpoint: 768px
- Mobile: Bottom navigation bar
- Sidebar: Collapsible (Cmd/Ctrl+B)
- Kanban: Horizontal scroll columns

**AI Auto-populate:**
- Extracts: title, frequency, time spent, owner
- Suggests: labels, checklist items
- Pattern matching for common keywords

---

## Files to Create in Phase 0

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── ideas/page.tsx
│       ├── projects/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── layout/          # Sidebar, Header, etc.
│   ├── theme/           # ThemeProvider, ThemeToggle
│   └── shared/          # Avatar, Labels, etc.
├── lib/
│   ├── supabase/        # Client, server helpers
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useTheme.ts
│   └── useIsMobile.ts
├── styles/
│   └── tokens.ts        # Design tokens from mockup
└── types/
    └── index.ts         # TypeScript interfaces
```

---

## Success Criteria for Phase 0

- [ ] Next.js app runs locally (`npm run dev`)
- [ ] Tailwind CSS configured with design tokens
- [ ] shadcn/ui initialized with dark theme
- [ ] Supabase project created and connected
- [ ] Basic ThemeProvider working
- [ ] Folder structure matches plan
- [ ] ESLint + Prettier configured
- [ ] CI/CD pipeline runs on push
- [ ] README updated with setup instructions
