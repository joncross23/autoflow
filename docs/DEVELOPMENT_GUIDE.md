# AutoFlow Development Guide

A simple, practical guide for developing AutoFlow.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Check for issues |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format all files |
| `npm run test` | Run tests |
| `npm run type-check` | TypeScript check |

---

## Branching Strategy

### Branch Types

```
main         → Production (protected, auto-deploys to Vercel)
develop      → Integration branch (merge features here first)
feature/*    → New features
fix/*        → Bug fixes
docs/*       → Documentation changes
```

### Workflow

```
1. Create branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature

2. Make changes with small commits

3. Push and create PR to develop
   git push -u origin feature/my-feature
   # Create PR on GitHub

4. After review, merge to develop

5. When ready for production, merge develop → main
```

### Branch Naming Examples

```bash
# Features
feature/add-search
feature/user-notifications
feature/export-to-csv

# Bug fixes
fix/login-redirect
fix/kanban-drag-drop

# Documentation
docs/api-reference
docs/update-readme
```

---

## Commit Messages

Use [Conventional Commits](https://conventionalcommits.org):

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting (no code change) |
| `refactor:` | Code restructure |
| `test:` | Adding tests |
| `chore:` | Maintenance |

### Examples

```bash
# Good
git commit -m "feat: add search to ideas page"
git commit -m "fix: resolve kanban drag-drop on mobile"
git commit -m "docs: update API documentation"

# Bad
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "wip"
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # Protected dashboard routes
│   └── api/               # API routes
├── components/
│   ├── ideas/             # Idea-related components
│   ├── projects/          # Project/Kanban components
│   ├── layout/            # Sidebar, navigation
│   ├── shared/            # Reusable components
│   ├── theme/             # Theme provider, toggle
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api/               # API functions (CRUD)
│   ├── ai/                # Claude AI integration
│   └── supabase/          # Database clients
└── types/                 # TypeScript definitions
```

---

## Code Conventions

### TypeScript
- Strict mode enabled
- No `any` types
- Export types from `src/types/`

### Components
- One component per file
- PascalCase naming
- Co-locate tests: `Component.test.tsx`

### Files
- Use kebab-case for files: `my-component.tsx`
- Use PascalCase for component names: `MyComponent`

---

## Adding Features

### 1. Plan First

Before coding, check:
- `/docs/CURRENT_STATE.md` — Current progress
- `/docs/backlog/` — Existing tasks and ideas

### 2. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 3. Implement

- Write code with types
- Add tests for complex logic
- Update `CURRENT_STATE.md` if completing a phase task

### 4. Verify

```bash
npm run build      # Must pass
npm run lint       # Must pass
npm run test       # Should pass
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: description of your feature"
git push -u origin feature/your-feature-name
```

### 6. Create Pull Request

- Create PR to `develop` on GitHub
- Add description of changes
- Link any related issues

---

## Working with the Database

### Supabase Setup

1. Set environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

2. Migrations are in `/supabase/migrations/`

### API Functions

All database operations go through `/src/lib/api/`:
- `ideas.ts` — Ideas CRUD
- `projects.ts` — Projects CRUD
- `tasks.ts` — Tasks CRUD
- `columns.ts` — Kanban columns
- `labels.ts` — Labels and assignments
- `checklists.ts` — Task checklists

### Example: Adding Data

```typescript
import { createIdea } from '@/lib/api/ideas';

const newIdea = await createIdea({
  title: 'My Idea',
  description: 'Description here',
  status: 'pending'
});
```

---

## Styling

### Theme System

- Dark mode default, light mode available
- 6 accent colours (set in Settings)
- CSS variables in `globals.css`

### Using Design Tokens

```css
/* Use these instead of hardcoded colours */
background-color: var(--bg);
color: var(--text);
border-color: var(--border);
```

### Component Classes

```html
<!-- Card -->
<div class="card">...</div>

<!-- Buttons -->
<button class="btn btn-primary">...</button>
<button class="btn btn-secondary">...</button>

<!-- Input -->
<input class="input" />
```

### Tailwind

Use Tailwind for layout and spacing:
```html
<div class="flex items-center gap-4 p-4">
```

---

## Testing

### Run Tests

```bash
npm run test           # Watch mode
npm run test -- --run  # Single run
npm run test:coverage  # With coverage
```

### Write Tests

```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Deployment

### Automatic (Vercel)

- Push to `main` → auto-deploys to production
- Push to `develop` → can set up preview deploys

### Environment Variables (Vercel Dashboard)

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Troubleshooting

### Build Fails

```bash
npm run build
# Check error output
# Most common: TypeScript errors or missing imports
```

### Lint Errors

```bash
npm run lint:fix  # Auto-fix what's possible
```

### Type Errors

```bash
npm run type-check  # See all type issues
```

### Database Issues

1. Check `.env.local` has correct Supabase credentials
2. Verify RLS policies allow your operation
3. Check browser console for Supabase errors

---

## Key Principles

1. **Keep it simple** — Don't over-engineer
2. **Test the build** — Run `npm run build` before pushing
3. **Small commits** — One logical change per commit
4. **Update docs** — Keep `CURRENT_STATE.md` current
5. **Use branches** — Never commit directly to `main`

---

## Getting Help

- Check existing code for patterns
- Read `/docs/PROJECT_CONTEXT.md` for full specs
- Review `/docs/decisions/` for architecture decisions
