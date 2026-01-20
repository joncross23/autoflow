# Layout Patterns Guide

> **Part of AutoFlow Design System Documentation**
> **Related:** [Tokens Reference](./tokens.md) | [Components Guide](./components.md) | [Design Audit Report](./audit-report.md)

---

## Overview

This guide defines standard layout patterns for AutoFlow screens, ensuring consistent structure, spacing, and visual hierarchy across all views.

**Key Principles:**
- Use semantic spacing tokens (not arbitrary values)
- Maintain consistent vertical rhythm
- Follow mobile-first responsive patterns
- Use elevation-based backgrounds for depth

---

## 1. Page Header Structure

### Standard Page Header

```tsx
<header className="border-b border-border bg-background sticky top-0 z-10">
  <div className="flex items-center justify-between px-6 py-4">
    {/* Left: Title + optional subtitle */}
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
      <p className="text-sm text-muted-foreground mt-1">Optional description</p>
    </div>

    {/* Right: Primary action */}
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add New
    </Button>
  </div>
</header>
```

**Specifications:**
- **Height:** `py-4` (16px top/bottom) + content = ~64px total
- **Horizontal padding:** `px-6` (24px)
- **Border:** `border-b border-border`
- **Background:** `bg-background` (ensures readability on scroll)
- **Sticky:** `sticky top-0 z-10` (stays visible when scrolling)
- **Title spacing:** `mt-1` (4px) between title and subtitle

### Page Header with Tabs

```tsx
<header className="border-b border-border bg-background sticky top-0 z-10">
  <div className="px-6 pt-4 pb-0">
    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
  </div>

  <Tabs defaultValue="account" className="px-6">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
    </TabsList>
  </Tabs>
</header>
```

**Usage:** Settings screens, multi-view pages

---

## 2. Main Content Area

### Standard Content Container

```tsx
<main className="flex-1 overflow-y-auto">
  <div className="container max-w-7xl mx-auto px-6 py-6 space-y-6">
    {/* Page sections go here */}
  </div>
</main>
```

**Specifications:**
- **Max width:** `max-w-7xl` (1280px) for readability
- **Horizontal padding:** `px-6` (24px) - matches header
- **Vertical padding:** `py-6` (24px) top/bottom
- **Section spacing:** `space-y-6` (24px between sections)
- **Overflow:** `overflow-y-auto` (enables scrolling)

### Full-Width Content (Tables, Boards)

```tsx
<main className="flex-1 overflow-y-auto">
  <div className="px-6 py-6">
    {/* Full-width table or kanban board */}
  </div>
</main>
```

**Usage:** Ideas Table, Delivery Board, Priority Matrix
**No max-width constraint** - uses full viewport width

---

## 3. Section Layouts

### Section with Header

```tsx
<section className="space-y-4">
  {/* Section header */}
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Section Title</h2>
    <Button variant="ghost" size="sm">View all</Button>
  </div>

  {/* Section content */}
  <div className="space-y-3">
    {/* Content items */}
  </div>
</section>
```

**Specifications:**
- **Section spacing:** `space-y-4` (16px) between header and content
- **Content item spacing:** `space-y-3` (12px) between items
- **Header alignment:** `justify-between` (title left, action right)
- **Action button:** `variant="ghost" size="sm"` (de-emphasized)

### Compact Section (Dashboard)

```tsx
<section className="space-y-3">
  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
    Section Title
  </h2>
  <div className="grid grid-cols-3 gap-4">
    {/* Stat cards */}
  </div>
</section>
```

**Usage:** Dashboard metric sections
**Spacing:** `space-y-3` (12px) for compact feel

---

## 4. Grid Layouts

### Stat Card Grid (Dashboard)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard label="Total Ideas" value={11} icon={Lightbulb} />
  <StatCard label="In Progress" value={3} icon={Workflow} />
  <StatCard label="Completed" value={8} icon={CheckCircle} />
</div>
```

**Specifications:**
- **Mobile:** `grid-cols-1` (stacked)
- **Desktop:** `md:grid-cols-3` (3 columns)
- **Gap:** `gap-4` (16px between cards)
- **Card height:** Auto (content-driven)

### Theme Preview Grid (Settings)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {themes.map(theme => (
    <ThemePreviewCard key={theme.id} theme={theme} />
  ))}
</div>
```

**Specifications:**
- **Gap:** `gap-6` (24px) - larger for visual separation
- **Card aspect ratio:** ~16:10 (width:height)

### Kanban Board Grid (Delivery)

```tsx
<div className="flex gap-4 overflow-x-auto pb-6">
  <Column title="Backlog" tasks={backlogTasks} />
  <Column title="In Progress" tasks={inProgressTasks} />
  <Column title="Done" tasks={doneTasks} />
</div>
```

**Specifications:**
- **Layout:** `flex` (horizontal, not grid)
- **Gap:** `gap-4` (16px between columns)
- **Scroll:** `overflow-x-auto` (horizontal scroll on mobile)
- **Bottom padding:** `pb-6` (24px) - space for scrollbar

---

## 5. Modal & Slider Patterns

### Standard Modal (Dialog)

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
    {/* Header - fixed */}
    <DialogHeader className="border-b border-border pb-4">
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>Optional description</DialogDescription>
    </DialogHeader>

    {/* Content - scrollable */}
    <div className="flex-1 overflow-y-auto py-6 space-y-6">
      {/* Modal content sections */}
    </div>

    {/* Footer - fixed */}
    <DialogFooter className="border-t border-border pt-4 flex-shrink-0">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Specifications:**
- **Width:** `max-w-2xl` (672px) - **STANDARD** for all modals
- **Max height:** `max-h-[90vh]` (90% of viewport height)
- **Layout:** `flex flex-col` (header/content/footer stack)
- **Header padding:** `pb-4` (16px bottom)
- **Content padding:** `py-6` (24px top/bottom)
- **Content spacing:** `space-y-6` (24px between sections)
- **Footer padding:** `pt-4` (16px top)
- **Scroll:** Only content area scrolls (header/footer fixed)
- **Border:** `border-b` on header, `border-t` on footer

**Accessibility:**
- Focus trap enabled (Tab cycles within modal)
- Escape key closes modal
- Focus returns to trigger element on close
- `role="dialog"` and `aria-labelledby` auto-applied by RadixUI

### Right Sidebar Slider (Idea/Task Detail)

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right" className="w-[600px] p-0 flex flex-col">
    {/* Header - fixed */}
    <SheetHeader className="border-b border-border p-6">
      <SheetTitle>Detail Title</SheetTitle>
    </SheetHeader>

    {/* Content - scrollable */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Detail sections */}
    </div>

    {/* Footer - fixed (optional) */}
    <div className="border-t border-border p-6">
      <Button className="w-full">Primary Action</Button>
    </div>
  </SheetContent>
</Sheet>
```

**Specifications:**
- **Width:** `w-[600px]` - **STANDARD** for all sliders (matches modal max-w-2xl)
- **Padding reset:** `p-0` on SheetContent (apply per section)
- **Header padding:** `p-6` (24px all sides)
- **Content padding:** `p-6` (24px all sides)
- **Content spacing:** `space-y-6` (24px between sections)
- **Footer padding:** `p-6` (24px all sides)
- **Scroll:** Only content area scrolls

**Current Issue (from audit):**
- ❌ Idea slider currently ~600px
- ❌ Task modal currently ~700px
- ✅ Should both be `max-w-2xl` (672px) for consistency

---

## 6. Table Layouts

### Standard Table Density

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead scope="col" className="w-[40%]">Name</TableHead>
      <TableHead scope="col" className="w-[15%]">Status</TableHead>
      <TableHead scope="col" className="w-[15%] text-right">RICE</TableHead>
      <TableHead scope="col" className="w-[15%]">Owner</TableHead>
      <TableHead scope="col" className="w-[15%]">Updated</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-secondary/50">
      <TableCell className="py-4">Idea name</TableCell>
      <TableCell className="py-4">
        <Badge variant="info">In Progress</Badge>
      </TableCell>
      <TableCell className="py-4 text-right font-variant-numeric-tabular">
        3.5
      </TableCell>
      <TableCell className="py-4">John Doe</TableCell>
      <TableCell className="py-4 text-muted-foreground">2 days ago</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Specifications:**
- **Row height:** `py-4` (16px top/bottom) = 48px total (comfortable)
- **Column widths:** Define with `w-[n%]` for predictable layout
- **Numeric columns:** `text-right` + `font-variant-numeric-tabular`
- **Hover state:** `hover:bg-secondary/50` (subtle highlight)
- **Metadata text:** `text-muted-foreground` (dates, secondary info)

### Compact Table Density

```tsx
<TableRow className="hover:bg-secondary/50">
  <TableCell className="py-2">Content</TableCell>
  {/* ... */}
</TableRow>
```

**Specifications:**
- **Row height:** `py-2` (8px top/bottom) = 32px total
- **Usage:** Dense data views, when vertical space is limited
- **Accessibility:** ⚠️ May be too small for touch targets on mobile

### Table Column Guidelines

| Column Type | Alignment | Width | Font |
|-------------|-----------|-------|------|
| Name/Title | Left | 30-50% | Default |
| Status/Badge | Left | 10-15% | Default |
| Numeric (RICE, ROI) | Right | 10-15% | Tabular nums |
| Date/Time | Left | 10-15% | Muted |
| Actions | Right | 10% | - |

**Key Rules:**
1. **Numeric data MUST be right-aligned** for easy comparison
2. Use `font-variant-numeric-tabular` for numeric columns
3. Status badges should be left-aligned (readable at a glance)
4. Actions column should be right-aligned (consistent location)

---

## 7. Empty State Patterns

### Standard Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-secondary p-4 mb-4">
    <Icon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
    Get started by creating your first item.
  </p>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Create item
  </Button>
</div>
```

**Specifications:**
- **Vertical padding:** `py-12` (48px top/bottom)
- **Icon container:** `rounded-full bg-secondary p-4` (circle background)
- **Icon size:** `h-8 w-8` (32px)
- **Heading spacing:** `mb-2` (8px below heading)
- **Description max width:** `max-w-sm` (384px) for readability
- **CTA spacing:** `mb-6` (24px below description)

### Compact Empty State (Table Row)

```tsx
<TableRow>
  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
    No items found. Try adjusting your filters.
  </TableCell>
</TableRow>
```

**Usage:** When table is empty but page has other content

---

## 8. Form Layouts

### Single Column Form (Settings)

```tsx
<form className="space-y-6 max-w-2xl">
  {/* Form section */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Section Title</h3>

    <div className="space-y-2">
      <Label htmlFor="name">Display name</Label>
      <Input id="name" placeholder="Enter your name" />
      <p className="text-sm text-muted-foreground">
        This will be visible to other users.
      </p>
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" />
    </div>
  </div>

  {/* Form actions */}
  <div className="flex justify-end gap-3 pt-6 border-t border-border">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Save changes</Button>
  </div>
</form>
```

**Specifications:**
- **Form max width:** `max-w-2xl` (672px) for readability
- **Section spacing:** `space-y-6` (24px between sections)
- **Field spacing:** `space-y-4` (16px between fields)
- **Label spacing:** `space-y-2` (8px label to input)
- **Helper text:** `text-sm text-muted-foreground` below input
- **Actions:** `pt-6 border-t` (24px top padding + border separator)
- **Button gap:** `gap-3` (12px between Cancel/Save)

### Two-Column Form (Compact)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="firstName">First name</Label>
    <Input id="firstName" />
  </div>

  <div className="space-y-2">
    <Label htmlFor="lastName">Last name</Label>
    <Input id="lastName" />
  </div>
</div>
```

**Usage:** When fields are related and short (names, dates, numeric values)

---

## 9. Responsive Patterns

### Mobile-First Breakpoints

```css
/* Tailwind breakpoints used in AutoFlow */
sm: 640px   /* Small tablet */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Responsive Grid

```tsx
{/* Mobile: stacked, Desktop: 3 columns */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Mobile: 2 cols, Desktop: 4 columns */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

### Responsive Padding

```tsx
{/* Mobile: 16px, Desktop: 24px */}
<div className="px-4 md:px-6">

{/* Mobile: 12px, Desktop: 24px */}
<div className="py-3 md:py-6">
```

### Responsive Typography

```tsx
{/* Mobile: 2xl, Desktop: 3xl */}
<h1 className="text-2xl md:text-3xl font-semibold">

{/* Mobile: base, Desktop: lg */}
<p className="text-base md:text-lg">
```

### Mobile Navigation

```tsx
{/* Sidebar hidden on mobile, visible on desktop */}
<aside className="hidden lg:block w-64 border-r border-border">

{/* Hamburger menu visible on mobile only */}
<Button variant="ghost" size="icon" className="lg:hidden">
  <Menu className="h-5 w-5" />
</Button>
```

---

## 10. Content Spacing Guidelines

### Vertical Rhythm Scale

| Spacing Token | Value | Use Case |
|---------------|-------|----------|
| `space-y-2` | 8px | Label → Input |
| `space-y-3` | 12px | Compact list items |
| `space-y-4` | 16px | Form fields, card content |
| `space-y-6` | 24px | Page sections, modal sections |
| `space-y-8` | 32px | Major page divisions |
| `space-y-12` | 48px | Empty state padding |

### Horizontal Spacing

| Spacing Token | Value | Use Case |
|---------------|-------|----------|
| `gap-2` | 8px | Icon + text in button |
| `gap-3` | 12px | Button groups |
| `gap-4` | 16px | Grid cards, kanban columns |
| `gap-6` | 24px | Theme preview grid |

### Padding Scale

| Component | Padding | Token |
|-----------|---------|-------|
| Button (sm) | 8px 12px | `px-3 py-2` |
| Button (default) | 12px 16px | `px-4 py-3` |
| Card (compact) | 16px | `p-4` |
| Card (default) | 24px | `p-6` |
| Modal content | 24px | `p-6` |
| Page container | 24px | `px-6 py-6` |

---

## 11. Z-Index Layers

```css
/* Z-index hierarchy (from globals.css) */
.z-sticky-header { z-index: 10; }   /* Sticky page headers */
.z-dropdown { z-index: 20; }        /* Dropdown menus */
.z-modal-overlay { z-index: 30; }   /* Modal backdrop */
.z-modal-content { z-index: 40; }   /* Modal/sheet content */
.z-toast { z-index: 50; }           /* Toast notifications */
```

**Usage:**
- Use semantic z-index classes, not arbitrary values
- Avoid z-index conflicts by following hierarchy
- Modals should always appear above page content

---

## 12. Common Layout Issues (from Audit)

### ❌ Issues Found

1. **Inconsistent section spacing**
   - Some screens use `space-y-6`, others use `space-y-4`, some use `space-y-8`
   - **Fix:** Use `space-y-6` (24px) as default for page sections

2. **Modal width mismatch**
   - Task modal: ~700px
   - Idea slider: ~600px
   - **Fix:** Both should use `max-w-2xl` (672px)

3. **Card padding variations**
   - Found: 12px, 16px, 20px, 24px
   - **Fix:** Use `p-4` (16px) for compact, `p-6` (24px) for default

4. **Table row height inconsistent**
   - Some tables use `py-2`, others `py-3`, others `py-4`
   - **Fix:** Use `py-4` (16px) for default density

5. **Empty state padding varies**
   - Found: 24px, 32px, 48px
   - **Fix:** Use `py-12` (48px) for standard empty states

### ✅ Correct Patterns

```tsx
{/* Page sections */}
<div className="space-y-6">

{/* Card content */}
<Card className="p-6">

{/* Modal content */}
<DialogContent className="max-w-2xl">
  <div className="py-6 space-y-6">

{/* Table row */}
<TableRow>
  <TableCell className="py-4">

{/* Empty state */}
<div className="py-12 text-center">
```

---

## 13. Layout Checklist

Use this checklist when building new screens:

**Page Structure:**
- [ ] Sticky header with `border-b` and consistent padding (`px-6 py-4`)
- [ ] Main content area with `overflow-y-auto`
- [ ] Consistent max-width (`max-w-7xl` for reading, none for tables)
- [ ] Horizontal padding matches header (`px-6`)

**Spacing:**
- [ ] Page sections use `space-y-6` (24px)
- [ ] Card content uses `space-y-4` (16px)
- [ ] Form fields use `space-y-4` (16px)
- [ ] Grid gaps use `gap-4` (16px) or `gap-6` (24px)

**Modals:**
- [ ] Width is `max-w-2xl` (672px)
- [ ] Max height is `max-h-[90vh]`
- [ ] Header has `border-b` and `pb-4`
- [ ] Content has `py-6 space-y-6` and scrolls
- [ ] Footer has `border-t` and `pt-4`

**Tables:**
- [ ] Row padding is `py-4` (48px total height)
- [ ] Numeric columns are right-aligned with tabular nums
- [ ] Column widths are defined with `w-[n%]`
- [ ] Hover state uses `hover:bg-secondary/50`

**Responsive:**
- [ ] Grids use `grid-cols-1 md:grid-cols-N`
- [ ] Padding scales with `px-4 md:px-6`
- [ ] Typography scales where appropriate
- [ ] Touch targets are ≥44px on mobile

---

## Related Documentation

- **[Tokens Reference](./tokens.md)** - Spacing scale, color palette, typography
- **[Components Guide](./components.md)** - Button, card, badge, form patterns
- **[Accessibility Standards](./accessibility.md)** - Contrast, touch targets, ARIA
- **[Design Audit Report](./audit-report.md)** - All layout issues identified

---

**Last Updated:** 2026-01-08
**Status:** Living document - update as patterns evolve
