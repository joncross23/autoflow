# AutoFlow Development Guide

> **Repository**: https://github.com/jon-cross/autoflow  
> **For Claude Code**: This file is read automatically. See `/docs/PROJECT_CONTEXT.md` for full specifications.

## Project Summary

**AutoFlow** is an AI & Automation Discovery Platform — a Next.js web app that helps businesses capture automation ideas, evaluate them with AI, and track implementation projects.

**Stack:** Next.js 14+ (App Router) | Supabase | Tailwind + shadcn/ui | Claude API | Vercel

**Hosting:** Vercel (linked to GitHub) | **Database:** Supabase (linked to GitHub)

## Current Phase

**Phase 0.5: Design Sprint** — ✅ COMPLETE. All mockups accepted.

**Phase 0: Foundation** — NEXT. Infrastructure setup.

**Always read `/docs/CURRENT_STATE.md` first** to understand current progress and focus.

### Sprint Mockups Status
- [x] `docs/mockups/theme-system.jsx` — Theme toggle, accent colours
- [x] `docs/mockups/kanban-board.jsx` — Drag-drop board
- [x] `docs/mockups/card-detail-modal.jsx` — Full card features
- [x] `docs/mockups/dashboard.jsx` — Main dashboard
- [x] `docs/mockups/questionnaire-form.jsx` — Public forms
- [x] `docs/mockups/mobile-views.jsx` — Responsive layouts

## Key Files

| File | Purpose |
|------|---------|
| `/docs/PROJECT_CONTEXT.md` | Full project specification |
| `/docs/CURRENT_STATE.md` | Current progress, blockers, next steps |
| `/docs/backlog/project.json` | All tasks in structured format |
| `/docs/backlog/ideas.json` | Ideas not yet converted to tasks |
| `/docs/mockups/` | Interactive JSX mockups for stakeholder review |
| `/docs/decisions/*.md` | Architecture Decision Records |
| `/docs/sprints/*.md` | Sprint plans and retrospectives |

## Git Workflow

### Branches
```
main        → Production (protected)
develop     → Integration branch
feature/*   → New features (e.g., feature/theme-system)
fix/*       → Bug fixes
docs/*      → Documentation only
mockup/*    → Design sprint mockups
```

### Commit Convention
Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use |
|--------|-----|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting (no code change) |
| `refactor:` | Code restructure (no behaviour change) |
| `test:` | Adding tests |
| `chore:` | Maintenance tasks |

**Examples:**
```bash
git commit -m "feat: add theme system mockup with 6 accent colours"
git commit -m "fix: improve contrast on accent-coloured backgrounds"
git commit -m "docs: update CURRENT_STATE with session progress"
```

### Workflow
1. Create feature branch from `develop`
2. Make changes with atomic, conventional commits
3. Push and create PR to `develop`
4. Merge to `main` for releases

For mockups during Phase 0.5, committing directly to `develop` is acceptable.

## Session Protocol

### At Session Start
1. Read `/docs/CURRENT_STATE.md` for current focus
2. Run `git status` to check for uncommitted work
3. Confirm current branch (`git branch --show-current`)

### During Session
1. Make atomic commits (one logical change per commit)
2. Update `/docs/CURRENT_STATE.md` when completing milestones

### At Session End
1. Commit all changes with clear messages
2. Push to remote
3. Update `/docs/CURRENT_STATE.md` if needed

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code

# Documentation
npm run docs:state   # Generate CURRENT_STATE.md from backlog
```

## Code Conventions

- **TypeScript** strict mode, no `any`
- **Components:** PascalCase, one component per file
- **Hooks:** `use` prefix, in `/src/hooks/`
- **Commits:** Conventional Commits format
- **Tests:** Co-located with source files (`*.test.ts`)

## Design Principles

- **Dark mode default** with light mode toggle
- **Seamless drag-and-drop** with clear visual feedback
- **AI-assisted, not AI-dependent** — users stay in control
- **Mobile-first PWA** for offline capture

### Accessibility Rule
> Text on `--primary-muted` or `--primary` backgrounds must use explicit white (`#FFFFFF` or `rgba(255,255,255,x)`), never `var(--text)`.

## Syncing with Claude Project

Claude Project (web) and Claude Code (CLI) share these files:
- `/docs/PROJECT_CONTEXT.md` — Specification
- `/docs/CURRENT_STATE.md` — Progress sync point
- `/docs/mockups/*.jsx` — Design artifacts

When making decisions in either environment, update `CURRENT_STATE.md` so the other stays informed.

After significant changes:
```bash
git add -A
git commit -m "docs: update state after [what you did]"
git push origin [branch]
```
