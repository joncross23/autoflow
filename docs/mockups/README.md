# AutoFlow Mockups

Interactive mockups for stakeholder review — **Phase 0.5 Complete**

---

## Main Prototype

| File | Version | Description |
|------|---------|-------------|
| **`autoflow-prototype-v4.4.html`** | v4.4 | **Latest** — Complete interactive prototype with all views |

### v4.4 Features
- All views connected: Dashboard, Ideas, Projects, Card Detail, Forms, Settings
- Full card editing with labels, checklists, comments, AI analysis
- AI Auto-populate — intelligent extraction from plain text
- System theme preference — follows OS dark/light mode
- Mobile responsive — bottom navigation, adaptive layouts
- Empty states — helpful UI when no data exists
- Pipeline widget — visual ideas funnel on dashboard
- Collapsible sidebar (Cmd/Ctrl+B)

### How to View
1. Open `autoflow-prototype-v4.4.html` directly in a browser
2. All React dependencies load from CDN (no build required)

---

## Advanced Styling System (Production-Ready)

A complete, framework-agnostic styling system for Phase 0 implementation:

| File | Purpose | Lines |
|------|---------|-------|
| **`theme-engine.js`** | Core theme system with 3 themes, 25+ CSS vars | 280+ |
| **`color-picker.jsx`** | HSB color picker with eyedropper | 300+ |
| **`theme-switcher.jsx`** | Settings UI for theme/mode/accent | 200+ |
| **`theme-demo-complete.jsx`** | Full working demonstration | 400+ |

**Documentation:**
| File | Purpose |
|------|---------|
| `THEME_INTEGRATION_GUIDE.md` | Step-by-step Next.js integration |
| `STYLING_QUICK_REFERENCE.md` | API reference and examples |
| `AGENT_DELIVERY_INSTRUCTIONS.md` | Implementation instructions |

**3 Professional Themes:**
1. **App Default** — Modern dark-first
2. **Windows 11** — Fluent Design minimalist
3. **macOS Tahoe** — Sequoia aesthetic

---

## Individual Mockups

These standalone mockups focus on specific features and can be rendered in Claude's artifact system or any React environment.

| File | Status | Description |
|------|--------|-------------|
| `theme-system.jsx` | Accepted | Dark/light/system mode, 6 accent themes |
| `kanban-board.jsx` | Accepted | Drag-drop with Trello-style UX |
| `card-detail-modal.jsx` | Accepted | Full card features, AI panel |
| `dashboard.jsx` | Accepted | Quick capture, stats, activity |
| `questionnaire-form.jsx` | Accepted | Public form with progress |
| `mobile-views.jsx` | Accepted | Responsive mobile layouts |

### Viewing JSX Mockups
1. Open a Claude conversation
2. Upload the `.jsx` file or paste its contents
3. Ask Claude to render it as an artifact

Or use CodeSandbox/StackBlitz with React 18.

---

## Design Specifications

### Theme System

**Mode Toggle Options:** Dark | Light | System

**CSS Custom Properties:**
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
| Theme | Primary | Hover | Muted |
|-------|---------|-------|-------|
| Midnight Blue | `#3B82F6` | `#2563EB` | `#1E3A5F` |
| Emerald Green | `#10B981` | `#059669` | `#064E3B` |
| Sunset Orange | `#F59E0B` | `#D97706` | `#78350F` |
| Royal Purple | `#8B5CF6` | `#7C3AED` | `#4C1D95` |
| Rose Pink | `#EC4899` | `#DB2777` | `#831843` |
| Slate Grey | `#64748B` | `#475569` | `#1E293B` |

**Accessibility Rule:**
> Text on `--primary-muted` or `--primary` backgrounds must use explicit white (`#FFFFFF` or `rgba(255,255,255,x)`), never `var(--text)`.

---

### Kanban Board

**Drag-Drop Behaviour:**
- Card pickup: `rotate(1.5deg)`, shadow `0 8px 24px rgba(0,0,0,0.25)`
- Ghost card: `opacity: 0.4` at original position
- Drop placeholder: 60px height, dashed border with `--primary`
- Animation timing: `0.12s ease-out`

**Column Features:**
- Coloured header indicator bar
- Card count with optional WIP limit
- Menu button (3-dot) fades in on hover
- Columns draggable to reorder

---

### Card Detail Modal

**Sections:**
- Header with inline title editing
- Labels with colour picker (10 colours)
- Description with markdown support
- Checklists (multiple per card, item due dates)
- AI Analysis panel (complexity, hours, value, suggestions)
- Attachments and links
- Comments thread
- Activity log (collapsible)

**Sidebar Actions:**
Members, Labels, Checklist, Dates, Attachments, Links, Cover, Custom Fields, Move, Copy, Archive, Watch, Delete

---

### Mobile Views

**Breakpoint:** 768px

**Adaptations:**
- Bottom navigation bar (replaces sidebar)
- Horizontal scroll kanban columns
- Touch-friendly drag handles
- Full-screen card modal
- Simplified Quick Capture

---

## Archived Mockups

Previous versions are stored in `../archive/mockups-v4/`

---

## Implementation Reference

When building components, extract from mockups:

1. **Design tokens** → `src/styles/tokens.ts`
2. **Theme provider** → `src/providers/ThemeProvider.tsx`
3. **Component patterns** → Individual component files

Implementation will use:
- Tailwind CSS (with design tokens)
- shadcn/ui components
- dnd-kit for drag-drop
- Framer Motion for animations
