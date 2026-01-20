# AutoFlow Component Patterns Guide

**Version:** 1.0
**Last Updated:** 2026-01-08
**Status:** Standardization in progress

---

## Overview

This guide defines the standard component patterns used throughout AutoFlow, including variants, sizing, states, and usage guidelines. Following these patterns ensures visual consistency and accessibility compliance.

**Component Philosophy:**
- **Composable** - Small, focused components that combine well
- **Consistent** - Same patterns work the same everywhere
- **Accessible** - WCAG AA compliance built-in
- **Theme-aware** - Respect user's chosen theme and accent color

---

## Button Component

### Variants

AutoFlow uses **4 primary button variants** based on visual hierarchy:

#### 1. Default (Primary Action)
```tsx
<Button variant="default">Primary Action</Button>
```
- **Appearance:** Filled with accent color background
- **Text:** White (`text-primary-foreground`)
- **When to use:** Primary action on screen, main CTA
- **Height:** `h-9` (36px) default, `h-11` (44px) on mobile
- **Examples:** "Save", "Create Idea", "Update password"

#### 2. Outline (Secondary Action)
```tsx
<Button variant="outline">Secondary Action</Button>
```
- **Appearance:** Border only, transparent background
- **Text:** Foreground color
- **When to use:** Secondary actions, cancel buttons
- **Height:** Same as primary
- **Examples:** "Cancel", "Back", "Skip"

#### 3. Ghost (Utility Action)
```tsx
<Button variant="ghost">Utility Action</Button>
```
- **Appearance:** No border, transparent background
- **Hover:** Subtle background tint
- **When to use:** Navigation, low-priority actions
- **Height:** Same as primary
- **Examples:** "View all activity", "Edit", sidebar navigation

#### 4. Destructive (Dangerous Action)
```tsx
<Button variant="destructive">Delete</Button>
```
- **Appearance:** Red background or red text
- **Text:** White on filled, red on ghost variant
- **When to use:** Irreversible or dangerous actions
- **Requires:** Confirmation dialog before action
- **Height:** Same as primary
- **Examples:** "Delete", "Remove", "Archive permanently"

### Size Variants

```tsx
/* Small - compact spaces */
<Button size="sm">Small Button</Button>
/* Height: h-8 (32px) */

/* Default - standard use */
<Button size="default">Default Button</Button>
/* Height: h-9 (36px) desktop, h-11 (44px) mobile */

/* Large - emphasis */
<Button size="lg">Large Button</Button>
/* Height: h-10 (40px) desktop, h-11 (44px) mobile */

/* Icon - square button */
<Button size="icon">
  <Icon className="h-4 w-4" />
</Button>
/* Size: h-9 w-9 (36x36px) desktop, h-11 w-11 (44x44px) mobile */
```

**Size Usage Guidelines:**
- **Small (h-8):** Table actions, compact toolbars, inline actions
- **Default (h-9):** Standard buttons throughout app (90% use case)
- **Large (h-10):** Hero CTAs, important form submits
- **Icon (h-9 w-9):** Icon-only buttons with `aria-label`

**Audit Finding:** Button heights vary inconsistently across screens (h-8, h-9, h-10 mixed).
**Fix:** Enforce h-9 as default, use size variants explicitly only when needed.

### States

**Interactive States:**
```tsx
/* Default state */
bg-primary text-primary-foreground

/* Hover state */
bg-primary/90 transition-colors

/* Active (pressed) state */
bg-primary/80

/* Focus state */
focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2

/* Disabled state */
disabled:opacity-50 disabled:pointer-events-none
```

**Loading State:**
```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Icon Buttons

**Always include `aria-label` for accessibility:**

```tsx
/* ✅ Correct */
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

/* ❌ Incorrect - no label */
<Button size="icon">
  <X className="h-4 w-4" />
</Button>
```

**Audit Finding:** 20+ icon-only buttons lack `aria-label` across all screens.
**Fix:** Add descriptive labels to all icon buttons.

### Button Groups

**Horizontal Groups:**
```tsx
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="default">Save</Button>
</div>
```

**Segmented Control (Toggle Group):**
```tsx
<div className="inline-flex rounded-lg border border-border p-1">
  <Button variant="ghost" size="sm" aria-pressed="true">
    Dark
  </Button>
  <Button variant="ghost" size="sm" aria-pressed="false">
    Light
  </Button>
  <Button variant="ghost" size="sm" aria-pressed="false">
    System
  </Button>
</div>
```

**Audit Finding:** Settings Appearance toggle lacks clear selected state.
**Fix:** Use `aria-pressed` and filled background for active button.

---

## Card Component

### Variants

#### 1. Base Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Optional footer
  </CardFooter>
</Card>
```

**Default Styles:**
- Border: `border border-border`
- Background: `bg-card` (uses `--bg-elevated`)
- Border radius: `rounded-xl` (16px)
- Padding: `p-6` (24px) for Header/Content/Footer

**Audit Finding:** Cards use varying padding (12px, 16px, 20px, 24px).
**Fix:** Standardize to `p-4` for stat cards, `p-6` for content cards.

#### 2. Stat Card (Metrics)
```tsx
<Card className="p-4">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-3xl font-bold">11</p>
      <p className="text-sm text-muted-foreground">Total Ideas</p>
    </div>
  </div>
</Card>
```

**Pattern:**
- Padding: `p-4` (16px) - compact
- Icon: 40px circle with 10% primary color background
- Value: `text-3xl font-bold`
- Label: `text-sm text-muted-foreground`

**Audit Finding:** Dashboard stat cards have cramped padding, labels low contrast.
**Fix:** Use consistent `p-4`, ensure label meets 4.5:1 contrast ratio.

#### 3. Content Card (Forms, Descriptions)
```tsx
<Card className="p-6">
  <h2 className="text-xl font-semibold mb-4">Section Heading</h2>
  <p className="text-sm text-secondary mb-6">
    Description text with comfortable spacing.
  </p>
  <form>...</form>
</Card>
```

**Pattern:**
- Padding: `p-6` (24px) - comfortable
- Heading: `text-xl font-semibold mb-4`
- Section spacing: `mb-6` between elements

#### 4. Draggable Card (Kanban)
```tsx
<Card className="p-3 cursor-grab active:cursor-grabbing">
  <div className="flex items-start gap-2">
    <GripVertical className="h-4 w-4 text-muted-foreground opacity-40 hover:opacity-100" />
    <div className="flex-1">
      <h3 className="text-sm font-medium">Task title</h3>
      <p className="text-xs text-muted-foreground">Description</p>
    </div>
  </div>
</Card>
```

**Pattern:**
- Padding: `p-3` (12px) - tight for density
- Drag handle: 6-dot grip icon, visible on hover
- Cursor: Changes to `grabbing` during drag
- Shadow: Elevated during drag (`shadow-drag`)

**Audit Finding:** Delivery Board cards lack visible drag affordance.
**Fix:** Add grip icon, show on hover with cursor change.

### Interactive States

```tsx
/* Hover state (clickable cards) */
className="hover:bg-card/80 transition-colors cursor-pointer"

/* Selected/Active state */
className="ring-2 ring-primary"

/* Disabled state */
className="opacity-50 pointer-events-none"
```

---

## Badge Component

### Variants

#### 1. Default Badge
```tsx
<Badge>New</Badge>
```
- Background: `bg-secondary`
- Text: `text-secondary-foreground`
- Padding: `px-2.5 py-0.5`
- Font: `text-xs font-semibold`
- Border radius: `rounded-full`

#### 2. Status Badges (Semantic)
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Blocked</Badge>
<Badge variant="info">In Progress</Badge>
```

**Color Requirements:**
- **Success:** Green background with white text (≥4.5:1 contrast)
- **Warning:** Amber/Gold background with black text (yellow fails with white)
- **Error:** Red background with white text (≥4.5:1 contrast)
- **Info:** Blue background with white text (≥4.5:1 contrast)

**Audit Finding:** Yellow "Evaluating" badges fail contrast on Ideas Table.
**Fix:** Use darker gold (#D97706) background or black text.

#### 3. Label Badges (Color-Coded)
```tsx
<Badge style={{
  backgroundColor: `${color}20`, /* 20% opacity */
  color: color,
  border: `1px solid ${color}40`
}}>
  Label Name
</Badge>
```

**10 Preset Colors:**
- green, yellow, orange, red, purple, blue, cyan, pink, lime, grey

**Accessibility Requirement:**
- Color alone insufficient - add text description or icon
- Ensure 4.5:1 contrast between badge background and card background
- Text on badge must meet 4.5:1 contrast

#### 4. Count Badges
```tsx
<div className="relative">
  <Button>Notifications</Button>
  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
    3
  </Badge>
</div>
```

**Pattern:**
- Size: `h-5 w-5` minimum (20x20px)
- Position: Absolute, top-right of parent
- Content: Number only, max 99+ for readability

### Accessibility

**Color-Independent Status:**
```tsx
/* ✅ Correct - icon + color */
<Badge variant="warning">
  <AlertTriangle className="mr-1 h-3 w-3" />
  Pending
</Badge>

/* ❌ Incorrect - color only */
<Badge variant="warning">Pending</Badge>
```

**Audit Finding:** All status badges rely on color alone.
**Fix:** Add icons to badges: ! for high priority, ✓ for complete, ⚠ for warning.

---

## Form Components

### Input Field

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email address</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    aria-describedby="email-hint"
  />
  <p id="email-hint" className="text-xs text-muted-foreground">
    We'll never share your email.
  </p>
</div>
```

**Standard Styles:**
- Height: `h-9` (36px) - consistent with buttons
- Border: `border border-input` (uses `--border-color`)
- Border radius: `rounded` (8px)
- Padding: `px-3 py-2`
- Font: `text-sm`
- Background: `bg-secondary`

**States:**
```tsx
/* Focus */
focus-visible:ring-2 focus-visible:ring-primary

/* Error */
<Input className="border-error" aria-invalid="true" />

/* Disabled */
<Input disabled className="opacity-50 cursor-not-allowed" />
```

**Audit Finding:** Input fields vary in height (h-8, h-9, h-10).
**Fix:** Enforce `h-9` for all text inputs, selects, textareas.

### Select / Dropdown

```tsx
<Select>
  <SelectTrigger className="h-9">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Standard Styles:**
- Height: `h-9` (36px) - matches input fields
- Border: Same as inputs
- Icon: Chevron down, 16px

**Audit Finding:** Priority dropdowns in RICE Score section use different heights.
**Fix:** Ensure all selects use `h-9`.

### Checkbox & Radio

```tsx
/* Checkbox */
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    Accept terms and conditions
  </label>
</div>

/* Radio Group */
<RadioGroup defaultValue="low">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="low" id="low" />
    <Label htmlFor="low">Low</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="high" id="high" />
    <Label htmlFor="high">High</Label>
  </div>
</RadioGroup>
```

**Accessibility:**
- **Checkbox/Radio size:** `w-4 h-4` (16px visual)
- **Clickable area:** Minimum 44x44px (add padding to label)
- **Label association:** Use `htmlFor` and `id` pairing

**Audit Finding:** Table checkboxes appear < 44px clickable area.
**Fix:** Add larger padding around checkbox to create 44x44px hit area.

### Textarea

```tsx
<Textarea
  placeholder="Enter description..."
  className="min-h-[150px] resize-y"
  aria-describedby="desc-hint"
/>
```

**Standard Styles:**
- Border/padding: Same as `<Input>`
- Min height: `min-h-[150px]` for usability
- Resize: `resize-y` (vertical only) or `resize-none`

---

## Modal / Dialog Component

### Structure

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Optional subtitle or context
      </DialogDescription>
    </DialogHeader>

    {/* Main content */}
    <div className="space-y-6">
      <p>Modal content goes here</p>
    </div>

    <DialogFooter className="sticky bottom-0 bg-background">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Standard Patterns:**
- **Width:** `max-w-2xl` (672px) for consistency
- **Padding:** `p-6` in DialogContent
- **Footer:** Sticky bottom with Cancel (left) + Primary action (right)
- **Backdrop:** Semi-transparent overlay (`bg-background/80`)
- **Close button:** X icon top-right with `aria-label="Close"`

**Audit Finding:** Task Detail Modal width differs from Idea Detail Slider (700px vs 600px).
**Fix:** Set both to `max-w-2xl` (672px) for consistency.

### Accessibility Requirements

**Focus Trap:**
```tsx
/* Must implement */
- Tab cycles within modal only
- Shift+Tab reverses direction
- Escape key closes modal
- Focus returns to trigger element on close
```

**ARIA Attributes:**
```tsx
<Dialog aria-labelledby="modal-title" aria-describedby="modal-desc">
  <DialogTitle id="modal-title">Title</DialogTitle>
  <DialogDescription id="modal-desc">Description</DialogDescription>
</Dialog>
```

**Audit Finding:** Modals lack focus trap implementation.
**Fix:** Add focus management with Tab cycling and Escape handler.

---

## Slide-Out Panel / Sheet

**Similar to Modal but anchored to edge:**

```tsx
<Sheet>
  <SheetContent side="right" className="w-full sm:max-w-2xl">
    <SheetHeader>
      <SheetTitle>Panel Title</SheetTitle>
      <SheetDescription>Optional description</SheetDescription>
    </SheetHeader>

    {/* Scrollable content */}
    <div className="h-full overflow-y-auto py-6">
      <div className="space-y-6">
        {/* Sections */}
      </div>
    </div>
  </SheetContent>
</Sheet>
```

**Standard Patterns:**
- **Width:** `max-w-2xl` (672px) - match modal width
- **Side:** Usually `right` for detail views
- **Scrolling:** Content area scrollable, header fixed
- **Close:** X button top-right + backdrop click + Escape

**Audit Finding:** Idea Detail Slider narrower than Task Modal.
**Fix:** Use consistent `max-w-2xl` width for both.

---

## Table Component

### Structure

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Name</TableHead>
      <TableHead scope="col">Status</TableHead>
      <TableHead scope="col" className="text-right">RICE</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Idea name</TableCell>
      <TableCell><Badge>New</Badge></TableCell>
      <TableCell className="text-right font-variant-numeric-tabular">3.5</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Standard Styles:**
- **Row height:** `h-12` (48px) or `h-14` (56px) for comfortable scanning
- **Cell padding:** `px-4 py-3`
- **Border:** `border-b border-border` on rows
- **Header:** `text-sm font-medium text-secondary`

**Column Alignment:**
- **Text columns:** Left-aligned (Name, Description)
- **Numeric columns:** Right-aligned with `text-right` + `font-variant-numeric: tabular-nums`
- **Status badges:** Center-aligned

**Audit Finding:** RICE scores left-aligned on Ideas Table and Time Audit.
**Fix:** Add `text-right` to all numeric columns, use tabular figures.

### Interactive States

```tsx
/* Hover */
<TableRow className="hover:bg-secondary/50 transition-colors cursor-pointer">

/* Selected */
<TableRow className="bg-secondary">

/* Checkbox Selection */
<TableRow>
  <TableCell>
    <Checkbox aria-label="Select this idea" />
  </TableCell>
  {/* ... */}
</TableRow>
```

**Audit Finding:** Tables lack row hover state and action affordance.
**Fix:** Add subtle hover background, show action menu (⋯) on row hover.

---

## Progress Component

### Linear Progress Bar

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>48h/wk committed</span>
    <span>12%</span>
  </div>
  <Progress value={12} className="h-2" aria-label="Planning horizon progress" />
</div>
```

**Standard Styles:**
- **Height:** `h-2` (8px) default
- **Background:** `bg-secondary`
- **Fill:** `bg-primary`
- **Border radius:** `rounded-full`

**Accessibility:**
```tsx
<Progress
  value={70}
  aria-valuenow={70}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Confidence level"
/>
```

**Audit Finding:** Time Audit progress bars lack axis labels and percentage text.
**Fix:** Always display value as text alongside visual bar, add aria attributes.

### Circular Progress (Spinner)

```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

**Usage:** Loading states in buttons, lazy-loaded content

---

## Empty State Component

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
    Get started by creating your first item.
  </p>
  <Button>Create Item</Button>
</div>
```

**Pattern:**
- Icon in circle background (secondary)
- Heading explains the empty state
- Description provides context or guidance
- Primary action CTA button

**Audit Finding:** Dashboard "Recent Activity" empty state lacks actionable guidance.
**Fix:** Add description explaining what creates activity.

---

## Accordion / Collapsible

```tsx
<Collapsible>
  <CollapsibleTrigger className="flex items-center justify-between w-full">
    <span className="text-sm font-medium">Section Title</span>
    <ChevronDown className="h-4 w-4 transition-transform" />
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="pt-4">
      Content goes here
    </div>
  </CollapsibleContent>
</Collapsible>
```

**Accessibility:**
```tsx
<Collapsible>
  <CollapsibleTrigger aria-expanded={isOpen} aria-controls="section-content">
    Section Title
  </CollapsibleTrigger>
  <CollapsibleContent id="section-content">
    Content
  </CollapsibleContent>
</Collapsible>
```

**Audit Finding:** Idea Detail Slider collapsible sections lack clear expand/collapse state.
**Fix:** Add `aria-expanded`, rotate chevron on state change.

---

## Component Library Summary

### Standard Component Heights

| Component | Desktop | Mobile | Class |
|-----------|---------|--------|-------|
| Button (default) | 36px | 44px | `h-9` / `h-11` |
| Button (small) | 32px | 36px | `h-8` / `h-9` |
| Button (large) | 40px | 44px | `h-10` / `h-11` |
| Input / Select | 36px | 36px | `h-9` |
| Checkbox / Radio | 16px | 16px | `w-4 h-4` (44px touch area) |
| Icon Button | 36px | 44px | `h-9 w-9` / `h-11 w-11` |
| Table Row | 48px | 48px | `h-12` |

### Standard Spacing

| Use Case | Spacing | Class |
|----------|---------|-------|
| Stat card padding | 16px | `p-4` |
| Content card padding | 24px | `p-6` |
| Section gap | 24px | `space-y-6` or `mb-6` |
| Major section gap | 32px | `space-y-8` or `mb-8` |
| Element gap (tight) | 8px | `gap-2` |
| Element gap (standard) | 12px | `gap-3` |
| Element gap (loose) | 16px | `gap-4` |

---

## References

**File Locations:**
- Button component: `/src/components/ui/button.tsx`
- Card component: `/src/components/ui/card.tsx`
- Badge component: `/src/components/ui/badge.tsx`
- Form components: `/src/components/ui/input.tsx`, `/src/components/ui/select.tsx`
- Modal/Dialog: `/src/components/ui/dialog.tsx`
- Table: `/src/components/ui/table.tsx`

**Related Documentation:**
- [Design Tokens Reference](./tokens.md)
- [Layout Patterns](./layouts.md)
- [Accessibility Standards](./accessibility.md)
- [Design Audit Report](./audit-report.md)

---

**Last Updated:** 2026-01-08
**Next Review:** After mockup improvements implemented
