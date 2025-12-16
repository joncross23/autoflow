# AutoFlow Mockups

Interactive mockups for stakeholder review — **Phase 0.5 Complete ✅**

## Viewing Mockups

These are React JSX files designed to run in Claude's artifact system:

1. Open a Claude conversation
2. Upload the `.jsx` file, or paste its contents
3. Ask Claude to render it as an artifact

Alternatively, these can be rendered in any React environment (CodeSandbox, StackBlitz, etc.) with minimal setup.

## Mockups

| File | Status | Description |
|------|--------|-------------|
| `theme-system.jsx` | ✅ Accepted | Dark/light/system mode, 6 accent colour themes |
| `kanban-board.jsx` | ✅ Accepted | Drag-drop with Trello-style UX |
| `card-detail-modal.jsx` | ✅ Accepted | Full card features, AI analysis panel |
| `dashboard.jsx` | ✅ Accepted | Quick capture, stats, pipeline, activity |
| `questionnaire-form.jsx` | ✅ Accepted | Public form with progress indicator |
| `mobile-views.jsx` | ✅ Accepted | Responsive mobile layouts |

## Design Decisions Captured

### Theme System (`theme-system.jsx`)

**CSS Custom Properties Architecture:**
```css
/* Mode colours (dark/light) */
--bg                /* Primary background */
--bg-secondary      /* Cards, sidebars */
--bg-tertiary       /* Inputs, nested elements */
--bg-elevated       /* Modals, popovers */
--border            /* Standard borders */
--border-subtle     /* Subtle dividers */
--text              /* Primary text */
--text-secondary    /* Secondary text */
--text-muted        /* Disabled, hints */

/* Accent colours (6 themes) */
--primary           /* Buttons, links, focus */
--primary-hover     /* Hover state */
--primary-muted     /* Backgrounds, badges */
--primary-gradient  /* Decorative gradients */
```

**Accent Colour Palettes:**
| Theme | Primary | Muted |
|-------|---------|-------|
| Midnight Blue | `#3B82F6` | `#1E3A5F` |
| Emerald Green | `#10B981` | `#064E3B` |
| Sunset Orange | `#F59E0B` | `#78350F` |
| Royal Purple | `#8B5CF6` | `#4C1D95` |
| Rose Pink | `#EC4899` | `#831843` |
| Slate Grey | `#64748B` | `#1E293B` |

**Accessibility Rule:**
> Any element with `background: var(--primary-muted)` or `background: var(--primary)` must use explicit white/light colours for text and icons, never `var(--text)`.

### Kanban Board (`kanban-board.jsx`)

**Drag-Drop Behaviour:**
- Card pickup: `rotate(1.5deg)`, soft shadow `0 8px 24px`
- Ghost card: Faded at original position (`opacity: 0.4`)
- Drop placeholder: Card-sized dashed box (60px height)
- No column background change on drag-over
- Card hover disabled during drag operations
- Column header menu button fades without layout shift

**Animation Timings:**
- Transitions: `0.12s ease-out`
- Subtle, professional feel matching Trello

### Card Detail Modal (`card-detail-modal.jsx`)

**Features:**
- Inline title editing
- Rich description with markdown preview
- Labels with colour picker
- Checklists with progress bar, item due dates
- Member avatars
- Attachments and links with previews
- Comments thread
- Activity log (collapsible)
- AI Analysis panel with metrics and suggestions
- Custom fields display
- Sidebar actions: Move, Copy, Archive, Watch, etc.

### Dashboard (`dashboard.jsx`)

**Widgets:**
- Quick capture input (always visible)
- Stats cards with trends
- Ideas pipeline summary
- Active projects list
- Recent activity feed
- Mini Kanban preview

### Questionnaire Form (`questionnaire-form.jsx`)

**Features:**
- Public-facing (no login required)
- Progress indicator
- Custom branding area
- Multi-step navigation
- AI analysis preview after submission

### Mobile Views (`mobile-views.jsx`)

**Adaptations:**
- Bottom navigation bar
- Collapsible sidebar
- Horizontal scroll kanban
- Touch-friendly drag handles
- Full-screen card modal
- Simplified forms

## Extracting for Implementation

When building real components, extract:

1. **Design tokens** → `src/styles/tokens.ts`
2. **Theme provider** → `src/providers/ThemeProvider.tsx`
3. **Component patterns** → Individual component files

The mockups serve as the visual specification; implementation will use proper Tailwind classes and shadcn/ui components.
