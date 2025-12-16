# ADR-001: Technology Stack Selection

## Status
Accepted

## Date
2024-12-16

## Context
We need to select a technology stack for AutoFlow that:
- Enables rapid development and iteration
- Supports real-time features for collaborative boards
- Provides robust authentication with MFA
- Is cost-effective for an SMB product
- Allows the development team (primarily using Claude Code) to work efficiently

## Decision

### Frontend Framework: Next.js 14+ (App Router)
- Server-side rendering for SEO and performance
- App Router for modern React patterns
- Built-in API routes reduce backend complexity
- Excellent Vercel integration for deployment

### Database & Auth: Supabase
- PostgreSQL with real-time subscriptions
- Built-in authentication with MFA support
- Row Level Security for data protection
- Generous free tier for development
- Already linked to GitHub account

### Styling: Tailwind CSS + shadcn/ui
- Utility-first for rapid UI development
- shadcn/ui provides accessible, customisable components
- Dark mode support out of the box
- Consistent design system

### AI: Anthropic Claude API
- Superior reasoning for idea evaluation
- Excellent at structured data extraction
- Consistent with development tooling (Claude Code)

### Deployment: Vercel
- Zero-config Next.js deployments
- Preview deployments for PRs
- Edge functions for performance
- Already linked to GitHub account

### Drag and Drop: dnd-kit
- Accessible by default
- Smooth animations
- Better React 18 support than alternatives
- Active maintenance

## Consequences

### Positive
- Unified JavaScript/TypeScript stack
- Fast development with familiar tools
- Strong typing throughout
- Cost-effective (generous free tiers)
- Excellent DX with Claude Code

### Negative
- Vendor lock-in with Supabase (mitigated: standard PostgreSQL)
- Vercel costs at scale (acceptable for MVP)
- Learning curve for App Router patterns

### Neutral
- Will need to manage Supabase migrations carefully
- Real-time features depend on Supabase reliability
