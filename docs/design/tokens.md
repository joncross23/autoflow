# AutoFlow Design Tokens Reference

**Version:** 1.0
**Last Updated:** 2026-01-08
**Status:** Standardization in progress

---

## Overview

Design tokens are the atomic building blocks of the AutoFlow design system. They define colors, spacing, typography, shadows, and other visual properties as named constants that ensure consistency across the application.

**Token Philosophy:**
- **Single source of truth** - All values defined in one place
- **Semantic naming** - Names describe purpose, not appearance
- **Cascade-friendly** - Tokens can reference other tokens
- **Theme-agnostic** - Work across all 3 system themes (AutoFlow, macOS, Windows)

---

## Color Palette

### Background Layers (Elevation-Based)

AutoFlow uses a layered background system where each level represents visual elevation:

```css
/* Base layer - furthest back */
--bg: #0A0A0B (dark) / #FAFAFA (light)

/* Secondary layer - cards on base */
--bg-secondary: #18181B (dark) / #F4F4F5 (light)

/* Tertiary layer - nested cards */
--bg-tertiary: #27272A (dark) / #E4E4E7 (light)

/* Elevated layer - modals, popovers */
--bg-elevated: #2D2D35 (dark) / #FFFFFF (light)

/* Interactive states */
--bg-hover: rgba(255,255,255,0.1) (dark) / rgba(0,0,0,0.05) (light)
--bg-active: rgba(255,255,255,0.15) (dark) / rgba(0,0,0,0.1) (light)
```

**Usage Guidelines:**
- Use `--bg` for page backgrounds
- Use `--bg-secondary` for main content cards
- Use `--bg-tertiary` for nested elements (cards within cards)
- Use `--bg-elevated` for floating elements (modals, dropdowns, tooltips)
- Use `--bg-hover` and `--bg-active` for interactive feedback only

**✅ Correct:**
```tsx
<div className="bg-background">
  <Card className="bg-card"> {/* Uses --bg-secondary */}
    <div className="bg-tertiary rounded-lg p-4">
      Nested content
    </div>
  </Card>
</div>
```

**❌ Incorrect:**
```tsx
<div style={{background: '#18181B'}}> {/* Hardcoded color */}
  <Card className="bg-[#2D2D35]"> {/* Arbitrary Tailwind value */}
```

---

### Text Colors (Hierarchy)

```css
/* Primary text - headings, important content */
--text: #FFFFFF (dark) / #09090B (light)

/* Secondary text - body content */
--text-secondary: #C8C8D0 (dark) / #52525B (light)

/* Muted text - labels, captions */
--text-muted: #9A9AA6 (dark) / #A1A1AA (light)

/* Inverted text - on colored backgrounds */
--text-inverted: #09090B (dark) / #FFFFFF (light)
```

**Usage Guidelines:**
- Use `--text` (or `text-foreground`) for headings, primary content, button labels
- Use `--text-secondary` for body text, descriptions
- Use `--text-muted` for labels, timestamps, helper text
- ⚠️ **CRITICAL:** Always verify `--text-muted` meets WCAG AA (4.5:1 contrast)

**Contrast Requirements:**
- `--text` on `--bg`: Must be ≥ 7:1 (AAA)
- `--text-secondary` on `--bg`: Must be ≥ 4.5:1 (AA)
- `--text-muted` on `--bg`: Must be ≥ 4.5:1 (AA) - **Currently fails in dark mode**

**Audit Finding:** Text contrast violations found on Dashboard, Time Audit, Settings. Use `text-foreground/80` instead of `text-muted-foreground` for better contrast.

---

### Primary Accent System

AutoFlow supports 6 accent colors that define the brand personality:

```css
/* Accent colors (choose one per theme) */
--accent-cyan: #06B6D4 (default)
--accent-blue: #3B82F6
--accent-emerald: #10B981
--accent-amber: #F59E0B
--accent-indigo: #6366F1
--accent-rose: #F43F5E

/* Applied accent (current theme selection) */
--primary-color: var(--accent-cyan) /* or other chosen accent */
--primary-hover: #0891B2 /* darker shade */
--primary-muted: #164E63 /* muted background */
--primary-gradient: linear-gradient(135deg, var(--primary-color), var(--primary-hover))
```

**Usage Guidelines:**
- Use `--primary-color` for primary buttons, links, focus rings
- Use `--primary-hover` for hover states on primary elements
- Use `--primary-muted` for subtle backgrounds (badges, highlights)
- Use `--primary-gradient` sparingly for hero elements only

**✅ Correct:**
```tsx
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>
```

**❌ Incorrect:**
```tsx
<Button className="bg-[#06B6D4]"> {/* Hardcoded accent */}
```

---

### Semantic Colors (Status)

```css
/* Success states */
--success: #22C55E
--success-muted: #064E3B

/* Warning states */
--warning: #F59E0B
--warning-muted: #78350F

/* Error states */
--error: #EF4444
--error-muted: #7F1D1D

/* Info states */
--info: #3B82F6
--info-muted: #1E3A5F
```

**Usage Guidelines:**
- Use semantic colors for status badges, alerts, validation feedback
- Always pair with text/icon for color-independent communication (WCAG 1.4.1)
- Ensure text on semantic backgrounds meets 4.5:1 contrast

**Badge Contrast Matrix:**
| Background | Text Color | Contrast | Pass? |
|------------|-----------|----------|-------|
| `--success` | white | 4.6:1 | ✅ AA |
| `--warning` | white | 3.2:1 | ❌ Fails - use black |
| `--error` | white | 5.1:1 | ✅ AA |
| `--info` | white | 4.8:1 | ✅ AA |

**Audit Finding:** Yellow badges on Dashboard and Ideas Table fail contrast. Use darker gold (#D97706) or ensure white text.

---

### Border Colors

```css
--border-color: rgba(255,255,255,0.08) (dark) / rgba(0,0,0,0.1) (light)
--border-subtle: rgba(255,255,255,0.04) (dark) / rgba(0,0,0,0.05) (light)
--border-strong: rgba(255,255,255,0.12) (dark) / rgba(0,0,0,0.2) (light)
```

**Usage Guidelines:**
- Use `--border-color` for standard card borders, dividers
- Use `--border-subtle` for inner dividers, section separators
- Use `--border-strong` for emphasized boundaries, selected states

---

## Spacing Scale

### Base Scale (4px/8px Grid)

All spacing follows a 4px base unit, with common values at 8px increments:

```css
--space-0: 0px
--space-1: 4px   /* 0.25rem */
--space-2: 8px   /* 0.5rem */
--space-3: 12px  /* 0.75rem */
--space-4: 16px  /* 1rem */
--space-5: 20px  /* 1.25rem */
--space-6: 24px  /* 1.5rem */
--space-8: 32px  /* 2rem */
--space-10: 40px /* 2.5rem */
--space-12: 48px /* 3rem */
```

**Tailwind Class Mapping:**
```tsx
space-1 → p-1, m-1, gap-1
space-2 → p-2, m-2, gap-2
space-4 → p-4, m-4, gap-4
space-6 → p-6, m-6, gap-6
space-8 → p-8, m-8, gap-8
```

### Semantic Spacing Tokens (Recommended)

To improve consistency, define semantic tokens for common use cases:

```css
/* Component internal spacing */
--spacing-component-compact: var(--space-4)    /* 16px - stat cards, tight layouts */
--spacing-component-default: var(--space-6)    /* 24px - content cards, forms */
--spacing-component-relaxed: var(--space-8)    /* 32px - modal content */

/* Section spacing (vertical rhythm) */
--spacing-section-tight: var(--space-4)        /* 16px - related items */
--spacing-section-default: var(--space-6)      /* 24px - standard sections */
--spacing-section-loose: var(--space-8)        /* 32px - major sections */
```

**Usage Guidelines:**

**Card Padding:**
- **Stat cards** (metrics, counts): `space-4` (16px)
- **Content cards** (descriptions, forms): `space-6` (24px)
- **Modal/slider content**: `space-6` or `space-8` (24-32px)

**Section Spacing (Vertical):**
- **Related items** (form fields in a group): `space-4` (16px)
- **Standard sections** (between expandable accordions): `space-6` (24px)
- **Major sections** (between page regions): `space-8` (32px)

**Element Spacing (Horizontal):**
- **Tight gaps** (icon + text): `space-2` (8px)
- **Standard gaps** (button groups): `space-3` (12px)
- **Loose gaps** (spaced-out toolbar items): `space-4` (16px)

**Audit Findings:**
- **Dashboard:** Inconsistent spacing between "Ideas Pipeline" and "Completed Ideas" sections
- **Settings Account:** Section gaps vary from 16px to 48px - standardize to 32px
- **Task Detail Modal:** Vertical spacing ranges from 12px to 48px - standardize to 24px

**✅ Correct:**
```tsx
<Card className="p-6"> {/* Content card */}
  <h2 className="mb-6">Section 1</h2>
  <p className="mb-6">Content</p>

  <h2 className="mb-6">Section 2</h2>
  <p>Content</p>
</Card>
```

**❌ Incorrect:**
```tsx
<Card className="p-4"> {/* Too tight for content */}
  <h2 className="mb-2">Section 1</h2> {/* Inconsistent spacing */}
  <p className="mb-8">Content</p>      {/* Random value */}
```

---

## Typography

### Font Families

```css
--font-sans:
  -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif;

--font-mono:
  "SF Mono", "Cascadia Code", "JetBrains Mono",
  Consolas, monospace;
```

**Note:** Plus Jakarta Sans is imported but not currently applied. Decision needed:
- Apply Plus Jakarta Sans for "luxury" branding, OR
- Remove import and commit to system fonts

### Type Scale (Headings)

```css
/* Heading sizes */
h1: text-3xl (30px / 1.875rem) line-height: 2.25rem
h2: text-2xl (24px / 1.5rem)   line-height: 2rem
h3: text-xl  (20px / 1.25rem)  line-height: 1.75rem
h4: text-lg  (18px / 1.125rem) line-height: 1.75rem
h5: text-base (16px / 1rem)    line-height: 1.5rem
h6: text-sm  (14px / 0.875rem) line-height: 1.25rem

/* All headings */
font-weight: 600 (semibold)
letter-spacing: -0.025em (tight)
```

**Usage Guidelines:**
- Use h1 for page titles (Dashboard, Ideas, Matrix, etc.)
- Use h2 for major section headings (Ideas Pipeline, Completed Ideas)
- Use h3 for subsection headings (By Planning Horizon, ROI Summary)
- Use h4 for card titles within sections
- Avoid h5/h6 - use text-sm with font-medium instead

**Audit Finding:** Section headings vary between text-lg and text-2xl on Dashboard. Standardize to text-xl for consistency.

### Body Text

```css
/* Body sizes */
text-base: 16px (default body text)
text-sm:   14px (labels, captions, table cells)
text-xs:   12px (timestamps, helper text, badges)
```

**Line Heights:**
```css
text-base: leading-relaxed (1.625 / 26px)
text-sm:   leading-normal (1.5 / 21px)
text-xs:   leading-tight (1.25 / 15px)
```

**Font Weights:**
```css
font-normal:   400 (body text)
font-medium:   500 (labels, emphasized text)
font-semibold: 600 (headings, buttons)
font-bold:     700 (stats, large numbers)
```

**Semantic Text Classes (Recommended):**
```tsx
/* Page heading */
className="text-2xl font-semibold tracking-tight"

/* Section heading */
className="text-xl font-semibold tracking-tight"

/* Subsection heading */
className="text-lg font-semibold"

/* Card title */
className="text-base font-semibold"

/* Label */
className="text-sm font-medium text-secondary"

/* Helper text */
className="text-xs text-muted"

/* Large stat */
className="text-3xl font-bold"
```

---

## Border Radius

```css
--radius-sm:   4px  (0.25rem)  /* Subtle rounding - badges, tags */
--radius:      8px  (0.5rem)   /* Default - cards, buttons, inputs */
--radius-lg:   12px (0.75rem)  /* Emphasized - large cards, modals */
--radius-xl:   16px (1rem)     /* Extra emphasis - hero elements */
--radius-full: 9999px          /* Circular - avatars, pills */
```

**Tailwind Class Mapping:**
```tsx
rounded-sm  → 4px
rounded     → 8px  (DEFAULT - use this for most elements)
rounded-md  → 6px  (calculated: var(--radius) - 2px)
rounded-lg  → 12px
rounded-xl  → 16px
rounded-full → circular
```

**Usage Guidelines:**
- **Cards:** `rounded-lg` (12px) for main cards, `rounded` (8px) for nested cards
- **Buttons:** `rounded` (8px) standard
- **Inputs:** `rounded` (8px) for consistency with buttons
- **Badges/Tags:** `rounded-full` for pill shape
- **Avatars:** `rounded-full` always
- **Modals:** `rounded-lg` (12px)

**Audit Finding:** Border radius inconsistent across screens:
- Dashboard: Quick Capture uses different radius than stat cards
- Delivery Board: Task cards appear more rounded than system standard
- Fix: Standardize all cards to `rounded-lg`, all buttons/inputs to `rounded`

---

## Shadows (Elevation System)

### Current State (Needs Consolidation)

**Problem:** Shadows defined in 3 places with conflicting values:
1. Tailwind config: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
2. CSS variables: `--shadow-sm` through `--shadow-xl`
3. Theme definitions: Custom shadow values per theme

**Recommended Unified System:**

```css
/* Elevation 0: Flat - no shadow */
--shadow-none: none

/* Elevation 1: Subtle - table rows, hover states */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1)

/* Elevation 2: Cards - default card elevation */
--shadow-card: 0 1px 3px rgba(0,0,0,0.2)

/* Elevation 3: Elevated - popovers, dropdowns */
--shadow-elevated: 0 4px 12px rgba(0,0,0,0.3)

/* Elevation 4: Modal - floating modals, dialogs */
--shadow-modal: 0 20px 40px rgba(0,0,0,0.6)

/* Drag state - cards being dragged */
--shadow-drag: 0 8px 24px rgba(0,0,0,0.4)
```

**Usage Guidelines:**
- Use `shadow-sm` for subtle hover states
- Use `shadow-card` for standard cards on page
- Use `shadow-elevated` for dropdowns, tooltips, popovers
- Use `shadow-modal` for modals, slide-out panels
- Use `shadow-drag` for draggable items during drag

**Theme Variations:**
- **AutoFlow:** Deep, dramatic shadows (20px blur for modals)
- **macOS:** Soft, layered shadows (12px blur for modals)
- **Windows:** Fluent elevation (16px blur for modals, higher saturation)

**Audit Recommendation:** Consolidate to single source of truth. Remove duplicates from Tailwind config and CSS variables. Keep theme-specific overrides only where needed.

---

## Transitions & Animations

### Transition Speeds

```css
--transition-fast:  100ms  /* Hover states, focus rings */
--transition-base:  150ms  /* Default - buttons, dropdowns */
--transition-slow:  300ms  /* Modals, page transitions */
```

**Usage Guidelines:**
```tsx
/* Button hover */
className="transition-colors duration-base"

/* Modal appearance */
className="transition-all duration-slow"

/* Focus ring */
className="transition-shadow duration-fast"
```

### Standard Easing

```css
ease-out:  cubic-bezier(0, 0, 0.2, 1)     /* Entering elements */
ease-in:   cubic-bezier(0.4, 0, 1, 1)     /* Exiting elements */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* Both directions */
```

**Theme-Specific Transition Speeds:**
- **AutoFlow:** 150ms (balanced)
- **macOS Tahoe:** 200ms (smoother, native feel)
- **Windows 11:** 167ms (Fluent Design standard)

---

## Touch Targets (Mobile)

### WCAG AAA Requirements

```css
--touch-target-min:    44px  /* Minimum for any interactive element */
--touch-target-comfortable: 48px  /* Recommended for primary actions */
```

**Utility Classes (Recommended):**
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.touch-target-sm {
  min-height: 36px; /* Use sparingly - not WCAG compliant */
  min-width: 36px;
}
```

**Application:**
- **Buttons:** Default should be h-11 (44px) on mobile, h-9 (36px) on desktop
- **Icon buttons:** Always h-11 w-11 (44px square) on mobile
- **Checkboxes:** Clickable area should be 44x44px (add padding if needed)
- **Sidebar nav:** Icons should be h-11 on mobile, h-9 on desktop

**Audit Finding:** Multiple touch target violations:
- Dashboard: Sidebar navigation icons appear < 44px
- Ideas Table: Checkboxes too small
- All screens: Icon-only buttons need larger touch areas
- Fix: Add `touch-target` class or increase button heights to h-11 on mobile

---

## Safe Areas (iOS)

```css
--safe-top:    env(safe-area-inset-top)
--safe-right:  env(safe-area-inset-right)
--safe-bottom: env(safe-area-inset-bottom)
--safe-left:   env(safe-area-inset-left)
```

**Utility Classes:**
```css
.safe-top    { padding-top: var(--safe-top) }
.safe-right  { padding-right: var(--safe-right) }
.safe-bottom { padding-bottom: var(--safe-bottom) }
.safe-left   { padding-left: var(--safe-left) }
.safe-x      { padding-left/right: var(--safe-left/right) }
.safe-y      { padding-top/bottom: var(--safe-top/bottom) }
.safe-all    { padding: var(--safe-top/right/bottom/left) }
```

**Usage:**
- Mobile bottom nav: Add `safe-bottom` class
- Modal close buttons: Add `safe-top` class
- Full-width content: Add `safe-x` class

---

## Token Migration Guide

### Phase 1: Immediate Fixes (Week 1)

**Replace hardcoded colors:**
```tsx
/* Before */
<div style={{color: '#FFFFFF'}}>

/* After */
<div className="text-foreground">
```

**Standardize card padding:**
```tsx
/* Before */
<Card className="p-4"> {/* or p-5, p-6 inconsistently */}

/* After - Stat cards */
<Card className="p-4">

/* After - Content cards */
<Card className="p-6">
```

**Fix spacing inconsistencies:**
```tsx
/* Before */
<div className="mb-2">Section 1</div>
<div className="mb-8">Section 2</div>

/* After */
<div className="mb-6">Section 1</div>
<div className="mb-6">Section 2</div>
```

### Phase 2: Semantic Tokens (Week 2-3)

Create semantic spacing tokens in `globals.css`:

```css
:root {
  /* Card padding tokens */
  --card-padding-compact: var(--space-4);
  --card-padding-default: var(--space-6);

  /* Section spacing tokens */
  --section-spacing: var(--space-6);
  --section-spacing-major: var(--space-8);

  /* Shadow tokens */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.2);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-modal: 0 20px 40px rgba(0,0,0,0.6);
}
```

Then use throughout components:
```tsx
<Card style={{padding: 'var(--card-padding-default)'}}>
```

### Phase 3: Consolidation (Week 4)

1. Remove shadow duplication from Tailwind config
2. Migrate all hardcoded shadows to CSS variables
3. Remove legacy accent aliases (orange, purple, pink, slate, violet)
4. Document deprecated tokens and migration path

---

## References

**File Locations:**
- Token definitions: `/src/app/globals.css` (lines 1-100)
- Tailwind config: `/src/tailwind.config.ts`
- Theme definitions: `/src/lib/themes/definitions/*.ts`

**Related Documentation:**
- [Component Patterns Guide](./components.md)
- [Layout Patterns](./layouts.md)
- [Accessibility Standards](./accessibility.md)
- [Design Audit Report](./audit-report.md)

---

**Last Updated:** 2026-01-08
**Next Review:** After mockup improvements implemented
