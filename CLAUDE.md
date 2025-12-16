# AutoFlow Development Guide

> **Repository**: https://github.com/jon-cross/autoflow  
> **For Claude Code**: This file is read automatically. See `/docs/PROJECT_CONTEXT.md` for full specifications.

## Project Summary

**AutoFlow** is an AI & Automation Discovery Platform — a Next.js web app that helps businesses capture automation ideas, evaluate them with AI, and track implementation projects.

**Stack:** Next.js 14+ (App Router) | Supabase | Tailwind + shadcn/ui | Claude API | Vercel

## Current Phase

**Phase 0.5: Design Sprint** — Creating interactive mockups for stakeholder approval before infrastructure setup.

See `/docs/CURRENT_STATE.md` for latest progress.

## Key Files

| File | Purpose |
|------|---------|
| `/docs/PROJECT_CONTEXT.md` | Full project specification |
| `/docs/CURRENT_STATE.md` | Current progress, blockers, next steps |
| `/docs/backlog/project.json` | All tasks in structured format |
| `/docs/backlog/ideas.json` | Ideas not yet converted to tasks |
| `/docs/decisions/*.md` | Architecture Decision Records |
| `/docs/sprints/*.md` | Sprint plans and retrospectives |

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

## Before Making Changes

1. Check `/docs/CURRENT_STATE.md` for current focus
2. Check `/docs/backlog/project.json` for task details
3. Update `CURRENT_STATE.md` after significant work
4. Commit with conventional commit message

## Design Principles

- **Dark mode default** with light mode toggle
- **Seamless drag-and-drop** with clear visual feedback
- **AI-assisted, not AI-dependent** — users stay in control
- **Mobile-first PWA** for offline capture

## When Updating Documentation

After any significant changes:

```bash
git add -A
git commit -m "docs: update state after [what you did]"
git push origin [branch]
```

This keeps Claude Project Knowledge in sync when files are re-uploaded.
