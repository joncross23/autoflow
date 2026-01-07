# AutoFlow Architecture

> This document describes how the app works. Keep it updated as the architecture evolves.

---

## Overview

AutoFlow is a Next.js 14+ application using the App Router, Supabase for database/auth, and Tailwind + shadcn/ui for styling.

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js App Router                   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐   │  │
│  │  │  Pages  │  │   API   │  │   Middleware    │   │  │
│  │  │ (React) │  │ Routes  │  │ (Auth redirect) │   │  │
│  │  └────┬────┘  └────┬────┘  └────────┬────────┘   │  │
│  │       │            │                │            │  │
│  │       └────────────┼────────────────┘            │  │
│  │                    │                             │  │
│  │            ┌───────▼───────┐                     │  │
│  │            │   /lib/api/   │                     │  │
│  │            │  (Data layer) │                     │  │
│  │            └───────┬───────┘                     │  │
│  └────────────────────┼─────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │     Supabase      │
              │  ┌─────┐ ┌─────┐  │
              │  │ DB  │ │Auth │  │
              │  └─────┘ └─────┘  │
              └───────────────────┘
```

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register) - public
│   ├── dashboard/         # Protected routes
│   │   ├── ideas/         # Ideas management
│   │   ├── projects/      # Projects & Kanban boards
│   │   └── settings/      # User settings
│   └── api/               # API routes
│
├── components/
│   ├── ideas/             # Idea cards, lists, filters
│   ├── projects/          # Kanban board, task cards
│   ├── layout/            # Sidebar, header, navigation
│   ├── shared/            # Reusable components (modals, buttons)
│   ├── theme/             # Theme provider, toggle
│   └── ui/                # shadcn/ui primitives
│
├── hooks/                 # Custom React hooks
│
├── lib/
│   ├── api/               # Data layer (CRUD operations)
│   ├── ai/                # Claude AI integration
│   ├── supabase/          # Database clients (browser/server)
│   ├── themes/            # Theme configuration
│   └── security/          # Input sanitisation
│
├── types/                 # TypeScript type definitions
│
└── middleware.ts          # Auth redirect logic
```

---

## Data Flow

### 1. Authentication
- Supabase Auth handles login/register
- `middleware.ts` redirects unauthenticated users to `/login`
- Auth state managed via Supabase client

### 2. Data Operations
All database operations go through `/src/lib/api/`:

| File | Manages |
|------|---------|
| `ideas.ts` | Ideas CRUD, status changes |
| `projects.ts` | Projects CRUD |
| `tasks.ts` | Tasks within projects |
| `columns.ts` | Kanban board columns |
| `labels.ts` | Labels and assignments |
| `checklists.ts` | Task checklists |
| `attachments.ts` | File attachments |

### 3. Component Pattern
```
Page (server component)
  └── Client Component (interactivity)
        └── Uses hooks for state
              └── Calls /lib/api/ for data
                    └── Supabase client executes query
```

---

## Key Patterns

### API Layer
- All Supabase queries are abstracted in `/lib/api/`
- Components never call Supabase directly
- Each API file exports typed functions

### Theme System
- CSS variables defined in `globals.css`
- Theme provider in `/components/theme/`
- 6 accent colours, dark/light mode toggle

### Error Handling
- API functions return typed results
- Components handle loading/error states
- Toast notifications for user feedback

---

## Database Schema

See Supabase dashboard or `/supabase/migrations/` for full schema.

**Core Tables:**
- `users` — User profiles
- `ideas` — Automation ideas
- `projects` — Implementation projects
- `tasks` — Tasks within projects
- `columns` — Kanban board columns
- `labels` — Categorisation labels

---

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Database, Auth, Storage | `NEXT_PUBLIC_SUPABASE_*` |
| Claude API | AI evaluation | `ANTHROPIC_API_KEY` |
| Vercel | Hosting, CI/CD | Auto from GitHub |

---

## Adding New Features

1. **Database changes** → Add migration in `/supabase/migrations/`
2. **API functions** → Add to relevant file in `/lib/api/`
3. **Types** → Update `/types/database.ts`
4. **Components** → Add to appropriate folder in `/components/`
5. **Pages** → Add route in `/app/`

---

*Last updated: January 2025*
