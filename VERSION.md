# AutoFlow Version History

## Current Version: 0.1.0

---

## Version 0.1.0 (2025-12-17)

**Type:** Initial Release

**Features:**
- Full authentication system (Supabase Auth)
- Ideas management with AI evaluation (Claude API)
- Projects kanban board with drag-and-drop
- Tasks management system
- Row Level Security (RLS) policies
- Convert ideas to projects functionality
- Dark/light theme system
- Responsive design (mobile + desktop)

**Technical Stack:**
- Next.js 14+ (App Router)
- Supabase (Database + Auth)
- Anthropic Claude API
- Tailwind CSS + shadcn/ui
- dnd-kit for drag-and-drop
- React Query for data fetching

**Bug Fixes:**
- Fixed RLS policy violation in convertIdeaToProject (added user_id)

---

## Versioning Guidelines

### When to Increment Versions

**Major Version (X.0.0):**
- Breaking changes to database schema
- Complete redesign or architecture change
- Major feature overhaul that changes core workflows

**Minor Version (0.X.0):**
- New significant features (e.g., new dashboard widget, export functionality)
- New integrations (e.g., new AI provider, external APIs)
- Significant UX improvements

**Patch Version (0.0.X):**
- Bug fixes
- Small UI tweaks
- Performance improvements
- Documentation updates

### Commit Process

When completing valuable functionality:
1. Verify changes work as expected
2. Update this VERSION.md file with changes
3. Commit with message: `feat: [description] (v0.X.0)` or `fix: [description] (v0.0.X)`
4. Agent should ask: "Should we commit these changes? Suggested version: [version number]"

---

## Upcoming Features

- User profile management
- Project templates
- Time tracking integration
- Team collaboration features
- Advanced AI insights dashboard
- Export/import functionality
