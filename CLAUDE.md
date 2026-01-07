# AutoFlow Development Guide

> **Repository**: https://github.com/joncross23/autoflow
> **Production**: https://autoflow23.vercel.app
> **Staging**: https://autoflow23-staging.vercel.app
> **For Claude Code**: This file is read automatically. See `/docs/PROJECT_CONTEXT.md` for full specifications.

## Project Summary

**AutoFlow** is an AI & Automation Discovery Platform — a Next.js web app that helps businesses capture automation ideas, evaluate them with AI, and track implementation projects.

**Stack:** Next.js 14+ (App Router) | Supabase | Tailwind + shadcn/ui | Claude API | Vercel

**Hosting:** Vercel (`joncross23-8264`) | **Database:** Supabase (`icdjurapdmimfdecgngw`)

## Current Phase

**Phase 0.5: Design Sprint** — ✅ COMPLETE. All mockups accepted.

**Phase 0: Foundation** — NEXT. Infrastructure setup.

**Always read `/docs/CURRENT_STATE.md` first** to understand current progress and focus.

## Working With Claude

### Before Making Changes
1. **Read first, act second** — Never speculate about code. Always read relevant files before answering questions or making changes.
2. **Check in before major changes** — For non-trivial work, present a brief plan and wait for approval before implementing.

### During Work
3. **Explain changes at a high level** — After each change, provide a brief summary of what was done.
4. **Keep it simple** — Every change should impact as little code as possible. Avoid complex refactors. Small, focused changes only.

### Documentation
5. **Maintain `/docs/ARCHITECTURE.md`** — Keep this file updated to describe how the app works inside and out.

### Code of Conduct
- Never guess file contents — open and read them
- No hallucinations — only make claims about code you've verified
- Ask questions when uncertain

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
| `/docs/ARCHITECTURE.md` | How the app works — structure, data flow, key patterns |
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

### Development Workflow

**Standard Gitflow Pattern** (develop → staging → main → production):

#### 1. Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature-name
```
**Always branch FROM `develop`** (not main)

#### 2. Develop Locally
```bash
npm run dev              # Test locally
npm run build            # Verify build
npm run lint             # Check code quality
npm run test:e2e        # Run E2E tests

git add .
git commit -m "feat: describe your changes"
```
Make atomic commits following Conventional Commits

#### 3. Merge to Develop (Staging)
```bash
git checkout develop
git pull origin develop
git merge feature/my-feature-name
git push origin develop
```
🚀 **Vercel auto-deploys** `develop` → **staging.vercel.app**

Or create a PR:
```bash
gh pr create --base develop --head feature/my-feature-name
```

#### 4. Verify on Staging
- Visit https://autoflow23-staging.vercel.app
- Test the feature thoroughly
- Run E2E tests against staging
- If issues found → fix in feature branch, merge to develop again

#### 5. Release to Production
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```
🚀 **Vercel auto-deploys** `main` → **autoflow23.vercel.app**

Or create a release PR:
```bash
gh pr create --base main --head develop --title "Release: v1.x.x"
```

#### 6. Cleanup
```bash
git branch -d feature/my-feature-name                # Local
git push origin --delete feature/my-feature-name     # Remote
```

### Hotfix Workflow

For critical production bugs:
```bash
git checkout main
git checkout -b hotfix/critical-bug
# Fix the bug
git commit -m "fix: resolve critical production bug"

# Deploy to production
git checkout main
git merge hotfix/critical-bug
git push origin main

# Sync back to develop
git checkout develop
git merge main
git push origin develop
```

### Branch Summary
- **`main`** → Production (protected, always deployable)
- **`develop`** → Staging (integration branch, feature merges here first)
- **`feature/*`** → Short-lived (1-3 days), single purpose, delete after merge
- **`fix/*`** → Bug fixes
- **`hotfix/*`** → Emergency production fixes

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

## Language Convention

**Use British English** throughout the application:

| American | British |
|----------|---------|
| analyze | analyse |
| visualize | visualise |
| prioritize | prioritise |
| customize | customise |
| organize | organise |
| optimize | optimise |
| color (in prose) | colour |
| behavior | behaviour |
| favorite | favourite |

> **Note:** CSS properties (`color`, `background-color`) and code identifiers remain unchanged — this applies only to user-facing text, comments, and documentation.

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
