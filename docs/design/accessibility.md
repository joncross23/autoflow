# Accessibility Standards Guide

> **Part of AutoFlow Design System Documentation**
> **Related:** [Tokens Reference](./tokens.md) | [Components Guide](./components.md) | [Layouts Guide](./layouts.md) | [Design Audit Report](./audit-report.md)

---

## Overview

AutoFlow follows **WCAG 2.1 Level AA** standards to ensure the application is usable by people with disabilities. This guide defines minimum requirements for color contrast, touch targets, keyboard navigation, and ARIA implementation.

**Key Standards:**
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Touch Targets:** 44x44px minimum (WCAG AAA on mobile)
- **Keyboard Navigation:** All interactive elements accessible via Tab
- **ARIA:** Semantic HTML first, ARIA labels when needed
- **Focus Indicators:** Visible 2px outline with sufficient contrast

---

## 1. Color Contrast Requirements

### WCAG AA Standards

| Content Type | Minimum Ratio | Example |
|--------------|---------------|---------|
| Normal text (< 18px) | **4.5:1** | Body text, labels, table cells |
| Large text (≥ 18px or bold 14px) | **3:1** | Headings, large UI text |
| UI components | **3:1** | Buttons, borders, focus indicators |
| Graphical objects | **3:1** | Icons, chart elements |

### AutoFlow Color Combinations

#### ✅ Compliant Combinations

**Text on Backgrounds:**
```css
/* WCAG AA: 4.5:1+ */
--text (#000000 in light, #FFFFFF in dark) on --bg
--text on --bg-secondary
--text on --bg-tertiary
--text-secondary on --bg (12:1 in light, 8:1 in dark)

/* Large text only: 3:1+ */
--text-muted on --bg (marginal, use for large headings only)
```

**Primary Accent on Backgrounds:**
```css
/* ONLY use white text on primary backgrounds */
#FFFFFF on --primary (cyan: 4.8:1, blue: 7.2:1, emerald: 5.1:1)
#FFFFFF on --primary-muted (cyan: 3.2:1, blue: 4.5:1, emerald: 3.8:1)
```

**Status Colors (Semantic):**
```css
/* Success */
#FFFFFF on --success (#059669) = 4.6:1 ✅

/* Warning */
#000000 on --warning (#F59E0B) = 9.5:1 ✅

/* Error */
#FFFFFF on --error (#DC2626) = 5.9:1 ✅

/* Info */
#FFFFFF on --info (#3B82F6) = 4.8:1 ✅
```

#### ❌ Non-Compliant Combinations (from Audit)

**Issues Found:**
1. **`var(--text)` on `--primary-muted` backgrounds** (15+ instances)
   - Fails WCAG AA (ratio < 4.5:1)
   - Found in: Stat cards, badges, active tab indicators
   - **Fix:** Use explicit white `#FFFFFF` or `rgba(255,255,255,1)`

2. **`text-muted-foreground` on `bg-secondary`** (8 instances)
   - Marginal contrast (ratio ~3:1)
   - Found in: Table metadata, card descriptions
   - **Fix:** Use `text-secondary` instead (4.5:1+)

3. **Gray text on gray backgrounds** (Priority Matrix labels)
   - Labels use `text-muted-foreground` on `bg-tertiary`
   - Ratio < 3:1 (fails even large text requirement)
   - **Fix:** Use `text-secondary` or increase label size

4. **Color-only status indicators**
   - Progress bars with green/yellow/red only (no text/icon)
   - Kanban cards with color-coded borders only
   - **Fix:** Add icon or text label to convey status

### Contrast Testing Tools

**In-Browser:**
- Chrome DevTools: Inspect element → Accessibility pane → Contrast ratio
- Firefox DevTools: Accessibility Inspector → Check for Issues

**External:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)

**CSS Variable Testing:**
```javascript
// Get computed color value
const bg = getComputedStyle(element).backgroundColor;
const text = getComputedStyle(element).color;

// Calculate contrast ratio
// Use tool: https://contrast-ratio.com/
```

---

## 2. Touch Target Sizing

### WCAG AAA Mobile Standards

**Minimum touch target size: 44x44px** (CSS pixels)

This ensures users can accurately tap interactive elements on mobile devices.

### AutoFlow Touch Targets

#### ✅ Compliant Sizes

```tsx
{/* Primary buttons - 44px tall on mobile */}
<Button size="default" className="h-11 md:h-9">
  Add idea
</Button>

{/* Icon buttons - 44x44px on mobile */}
<Button variant="ghost" size="icon" className="h-11 w-11 md:h-9 md:w-9">
  <Settings className="h-5 w-5" />
</Button>

{/* Checkbox - 24x24px with 44px hit area */}
<Checkbox className="h-6 w-6 p-2" /> {/* Padding extends hit area */}

{/* Table row - 48px tall (exceeds 44px) */}
<TableRow>
  <TableCell className="py-4">{/* 16px top/bottom + content */}</TableCell>
</TableRow>

{/* Kanban card - 120px+ tall (easy to drag) */}
<Card className="p-3 min-h-[120px]">
```

#### ❌ Non-Compliant Sizes (from Audit)

**Issues Found:**
1. **Desktop button heights used on mobile** (20+ instances)
   - `h-9` (36px) - too small for touch
   - **Fix:** Use `h-11 md:h-9` (44px mobile, 36px desktop)

2. **Icon-only buttons too small** (Settings gear, filter toggle)
   - `h-8 w-8` (32px) - below WCAG AAA threshold
   - **Fix:** Use `h-11 w-11 md:h-9 md:w-9`

3. **Compact table density on mobile** (Ideas Table)
   - `py-2` = 32px row height
   - **Fix:** Use `py-4` (48px) or disable compact mode on mobile

4. **Small badge click targets** (Kanban labels)
   - 24px tall badges with 4px padding = 32px total
   - **Fix:** If interactive, increase to `h-11` or add `p-2`

5. **Drag handles too small** (Kanban cards)
   - 16x16px grip icon
   - **Fix:** Increase entire card drag area (not just handle)

### Touch Target Implementation

```tsx
{/* Responsive button sizing */}
<Button
  size="default"
  className="h-11 md:h-9" // 44px mobile, 36px desktop
>
  Click me
</Button>

{/* Icon button with responsive sizing */}
<Button
  variant="ghost"
  size="icon"
  className="h-11 w-11 md:h-9 md:w-9"
  aria-label="Open settings" // Required for screen readers
>
  <Settings className="h-5 w-5" />
</Button>

{/* Small visual element with large hit area */}
<button
  className="relative h-11 w-11 flex items-center justify-center"
  aria-label="More options"
>
  <MoreVertical className="h-4 w-4" /> {/* Visual: 16px */}
  {/* Clickable area: 44px */}
</button>

{/* Checkbox with extended hit area */}
<div className="flex items-center gap-3">
  <Checkbox id="agree" className="h-6 w-6" />
  <Label
    htmlFor="agree"
    className="cursor-pointer py-2" // Extends clickable area
  >
    I agree to terms
  </Label>
</div>
```

---

## 3. Keyboard Navigation

### Tab Order & Focus Management

**All interactive elements must be keyboard accessible:**
- Buttons, links, inputs, selects
- Custom interactive elements (drag handles, expand toggles)
- Modal dialogs and sliders

#### Focus Order Rules

1. **Logical tab order** - follows visual reading order (left-to-right, top-to-bottom)
2. **Skip links** - provide "Skip to main content" for screen reader users
3. **Focus traps** - modals/dialogs trap focus until closed
4. **No keyboard traps** - user can always navigate away

#### AutoFlow Focus Order

```tsx
{/* Page header → main content → footer */}
<body>
  <a href="#main" className="sr-only focus:not-sr-only">
    Skip to main content
  </a>

  <header>
    <nav>{/* Tab 1-5: Navigation links */}</nav>
    <Button>{/* Tab 6: Primary action */}</Button>
  </header>

  <main id="main">
    {/* Tab 7+: Page content */}
  </main>
</body>

{/* Modal focus trap */}
<Dialog open={isOpen}>
  <DialogContent>
    {/* Focus moves to first focusable element */}
    <DialogHeader>
      <DialogTitle>Title</DialogTitle> {/* Not focusable */}
    </DialogHeader>

    <Input autoFocus /> {/* Tab 1 inside modal */}
    <Button>Save</Button> {/* Tab 2 */}
    <Button>Cancel</Button> {/* Tab 3 */}

    {/* Tab 3 + Tab → cycles back to Tab 1 */}
    {/* Shift + Tab from Tab 1 → Tab 3 */}
  </DialogContent>
</Dialog>
```

### Focus Indicators

**All focusable elements must have visible focus indicators:**

```css
/* Global focus ring (from globals.css) */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Custom focus rings for specific components */
.button:focus-visible {
  ring: 2px;
  ring-color: var(--primary);
  ring-offset: 2px;
  ring-offset-color: var(--bg);
}

/* Ensure focus ring has sufficient contrast */
/* Minimum 3:1 against adjacent colors (WCAG 2.1) */
```

**Implementation:**
```tsx
{/* Tailwind focus ring utilities */}
<Button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">

{/* Custom elements need manual focus styles */}
<div
  tabIndex={0}
  className="focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
  role="button"
>
  Custom button
</div>
```

### Keyboard Shortcuts

**Standard shortcuts AutoFlow must support:**

| Key | Action | Context |
|-----|--------|---------|
| **Tab** | Navigate forward | Global |
| **Shift + Tab** | Navigate backward | Global |
| **Enter** | Activate button/link | Focusable elements |
| **Space** | Activate button/checkbox | Buttons, checkboxes |
| **Escape** | Close modal/dropdown | Modals, menus |
| **Arrow keys** | Navigate menu items | Dropdowns, select |
| **Home/End** | Jump to first/last | Lists, tables |

**Custom shortcuts (optional):**
- `Cmd/Ctrl + K` - Quick search
- `Cmd/Ctrl + N` - New idea
- `Cmd/Ctrl + /` - Show keyboard shortcuts

---

## 4. ARIA Implementation

### Semantic HTML First

**Always prefer semantic HTML over ARIA:**

```tsx
{/* ✅ Semantic HTML */}
<button>Click me</button>
<nav><a href="/dashboard">Dashboard</a></nav>
<main><h1>Page Title</h1></main>

{/* ❌ Avoid generic elements with ARIA */}
<div role="button" tabIndex={0}>Click me</div>
<div role="navigation"><span role="link">Dashboard</span></div>
```

**When to use ARIA:**
- Icon-only buttons (missing text label)
- Custom interactive elements (drag handles, expand toggles)
- Dynamic content updates (loading states, error messages)
- Complex widgets (autocomplete, date picker, kanban board)

### Required ARIA Attributes

#### Icon Buttons (20+ missing in audit)

```tsx
{/* ❌ Missing label - screen reader says "button" (unclear) */}
<Button variant="ghost" size="icon">
  <Settings className="h-5 w-5" />
</Button>

{/* ✅ With aria-label - screen reader says "Open settings button" */}
<Button variant="ghost" size="icon" aria-label="Open settings">
  <Settings className="h-5 w-5" />
</Button>

{/* ✅ Alternative: visually hidden text */}
<Button variant="ghost" size="icon">
  <Settings className="h-5 w-5" />
  <span className="sr-only">Open settings</span>
</Button>
```

#### Form Inputs

```tsx
{/* ✅ Label with htmlFor (creates implicit association) */}
<Label htmlFor="email">Email address</Label>
<Input id="email" type="email" />

{/* ✅ With validation error */}
<Label htmlFor="password">Password</Label>
<Input
  id="password"
  type="password"
  aria-invalid={hasError}
  aria-describedby={hasError ? "password-error" : undefined}
/>
{hasError && (
  <p id="password-error" className="text-error text-sm" role="alert">
    Password must be at least 8 characters
  </p>
)}

{/* ✅ With helper text */}
<Label htmlFor="name">Display name</Label>
<Input id="name" aria-describedby="name-help" />
<p id="name-help" className="text-sm text-muted-foreground">
  This will be visible to other users.
</p>
```

#### Dynamic Content (Loading, Errors)

```tsx
{/* ✅ Loading state announced to screen readers */}
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <p>Loading ideas...</p>
  ) : (
    <IdeasList ideas={ideas} />
  )}
</div>

{/* ✅ Error message announced immediately */}
<div role="alert" aria-live="assertive" className="text-error">
  {error && <p>Failed to load ideas. Please try again.</p>}
</div>

{/* ✅ Success toast */}
<div role="status" aria-live="polite">
  Idea saved successfully!
</div>
```

#### Tables

```tsx
{/* ✅ Table with proper headers */}
<Table>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Name</TableHead> {/* scope="col" for screen readers */}
      <TableHead scope="col">Status</TableHead>
      <TableHead scope="col">RICE</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Automate email reports</TableCell>
      <TableCell><Badge variant="info">In Progress</Badge></TableCell>
      <TableCell>3.5</TableCell>
    </TableRow>
  </TableBody>
</Table>

{/* ✅ Sortable table */}
<TableHead scope="col">
  <Button
    variant="ghost"
    onClick={() => sortBy('name')}
    aria-label={`Sort by name ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
  >
    Name
    {sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
  </Button>
</TableHead>
```

#### Modals & Dialogs

```tsx
{/* ✅ Modal with proper ARIA (handled by RadixUI) */}
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Auto-applied attributes: */}
    {/* role="dialog" */}
    {/* aria-modal="true" */}
    {/* aria-labelledby="dialog-title" */}
    {/* aria-describedby="dialog-description" */}

    <DialogTitle id="dialog-title">Delete idea</DialogTitle>
    <DialogDescription id="dialog-description">
      This action cannot be undone.
    </DialogDescription>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Drag & Drop

```tsx
{/* ✅ Draggable card with keyboard support */}
<div
  draggable
  role="button"
  tabIndex={0}
  aria-label={`Drag ${task.name} to reorder`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Activate drag mode or show context menu
    }
  }}
>
  <Card>
    <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    <p>{task.name}</p>
  </Card>
</div>

{/* Drop zone */}
<div
  role="region"
  aria-label="Backlog column"
  onDrop={handleDrop}
  onDragOver={handleDragOver}
>
  {/* Tasks */}
</div>
```

### ARIA Landmarks

```tsx
{/* ✅ Page structure with landmarks */}
<body>
  <header role="banner"> {/* Site header */}
    <nav role="navigation" aria-label="Main navigation">
      {/* Nav links */}
    </nav>
  </header>

  <main role="main"> {/* Primary content */}
    <section aria-labelledby="ideas-heading">
      <h2 id="ideas-heading">Ideas in Progress</h2>
      {/* Section content */}
    </section>
  </main>

  <aside role="complementary" aria-label="Filters"> {/* Sidebar */}
    {/* Filter controls */}
  </aside>

  <footer role="contentinfo"> {/* Site footer */}
    {/* Footer content */}
  </footer>
</body>
```

---

## 5. Screen Reader Considerations

### Visually Hidden Content

```css
/* Screen reader only class (from globals.css) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Visible when focused (for skip links) */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Usage:**
```tsx
{/* Skip link (visible on focus) */}
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
  Skip to main content
</a>

{/* Icon button label */}
<Button variant="ghost" size="icon">
  <Settings className="h-5 w-5" />
  <span className="sr-only">Open settings</span>
</Button>

{/* Decorative icon (hide from screen readers) */}
<Lightbulb className="h-5 w-5" aria-hidden="true" />
<span>Idea</span>
```

### Status Announcements

```tsx
{/* Announce changes to screen readers */}
<div aria-live="polite" aria-atomic="true">
  <p>Showing {filteredIdeas.length} of {totalIdeas} ideas</p>
</div>

{/* Urgent announcements */}
<div role="alert" aria-live="assertive">
  {error && <p>Error: {error.message}</p>}
</div>
```

**`aria-live` values:**
- `polite` - Announce when user is idle (non-urgent updates)
- `assertive` - Interrupt immediately (errors, critical alerts)
- `off` - Do not announce (default)

---

## 6. Color Blindness Considerations

### Do Not Rely on Color Alone

**❌ Issues Found (from audit):**
1. **Progress bars** - green/yellow/red only (no text/icon)
2. **Kanban cards** - color-coded borders without status badges
3. **Priority Matrix** - color quadrants without labels
4. **Status indicators** - colored dots without text

**✅ Fixes:**

```tsx
{/* ❌ Color only */}
<div className="h-2 bg-success rounded-full" />

{/* ✅ Color + text */}
<div className="flex items-center gap-2">
  <div className="h-2 w-full bg-success rounded-full" />
  <span className="text-sm">75% complete</span>
</div>

{/* ✅ Color + icon + text */}
<Badge variant="success">
  <CheckCircle className="h-3 w-3 mr-1" />
  Completed
</Badge>

{/* ❌ Colored dot only */}
<div className="h-2 w-2 rounded-full bg-warning" />

{/* ✅ Icon + text with semantic color */}
<div className="flex items-center gap-2 text-warning">
  <AlertCircle className="h-4 w-4" />
  <span>Blocked</span>
</div>
```

### Color Palette Accessibility

AutoFlow's 6 accent colors are tested for common color blindness types:

| Accent | Protanopia | Deuteranopia | Tritanopia |
|--------|-----------|--------------|------------|
| Cyan | ✅ Distinct | ✅ Distinct | ✅ Distinct |
| Blue | ✅ Distinct | ✅ Distinct | ❌ Similar to cyan |
| Emerald | ⚠️ Similar to amber | ⚠️ Similar to amber | ✅ Distinct |
| Amber | ⚠️ Similar to emerald | ⚠️ Similar to emerald | ✅ Distinct |
| Indigo | ✅ Distinct | ✅ Distinct | ❌ Similar to rose |
| Rose | ✅ Distinct | ✅ Distinct | ❌ Similar to indigo |

**Recommendation:** When using accent colors for data visualization, always pair with text labels or patterns (not color alone).

---

## 7. Motion & Animation

### Respect `prefers-reduced-motion`

Users with vestibular disorders may experience dizziness from animations.

```css
/* Respect user preference (from globals.css) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implementation:**
```tsx
{/* Conditional animation */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3
  }}
>
  Content
</motion.div>

{/* Tailwind transition with reduced motion support */}
<div className="transition-all duration-300 motion-reduce:transition-none">
  Hover me
</div>
```

---

## 8. Accessibility Testing Checklist

### Manual Testing

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Ensure logical tab order (matches visual order)
- [ ] Verify focus indicators are visible (2px outline)
- [ ] Test Escape key closes modals/dropdowns
- [ ] Test Enter/Space activates buttons
- [ ] Confirm no keyboard traps

**Screen Reader Testing:**
- [ ] Test with VoiceOver (Mac), NVDA (Windows), or JAWS (Windows)
- [ ] Verify icon buttons have labels
- [ ] Confirm form errors are announced
- [ ] Check landmark navigation works (header, main, nav, etc.)
- [ ] Verify dynamic content updates are announced

**Color Contrast:**
- [ ] Check all text/background combinations with DevTools
- [ ] Verify status colors meet WCAG AA (4.5:1 for small text)
- [ ] Confirm focus indicators have 3:1 contrast
- [ ] Test with color blindness simulators

**Touch Targets (Mobile):**
- [ ] Verify all buttons are ≥44x44px on mobile
- [ ] Check table rows are ≥48px tall
- [ ] Confirm icon buttons are ≥44px
- [ ] Test spacing between adjacent targets (≥8px)

### Automated Testing Tools

**Browser Extensions:**
- [axe DevTools](https://www.deque.com/axe/devtools/) - Comprehensive WCAG audits
- [WAVE](https://wave.webaim.org/extension/) - Visual accessibility feedback
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome built-in

**CLI Tools:**
```bash
# Playwright accessibility tests
npx playwright test --grep accessibility

# axe-core integration
npm install @axe-core/playwright
```

**Example Playwright Test:**
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 9. Common Accessibility Issues (from Audit)

### Critical Issues (Must Fix)

1. **❌ Color contrast violations (15+ instances)**
   - `var(--text)` on `--primary-muted` backgrounds
   - **Fix:** Use explicit white `#FFFFFF`
   - **Screens affected:** Dashboard stat cards, badge text, active tabs

2. **❌ Missing aria-labels on icon buttons (20+ instances)**
   - Settings gear, filter toggle, edit/delete buttons
   - **Fix:** Add `aria-label` or visually hidden text
   - **Screens affected:** All screens with icon buttons

3. **❌ Color-only status indicators**
   - Progress bars, Kanban card borders, Priority Matrix quadrants
   - **Fix:** Add text labels or icons
   - **Screens affected:** Delivery Board, Priority Matrix, Time Audit

4. **❌ Touch targets too small on mobile**
   - Desktop button sizes used on mobile (36px)
   - **Fix:** Use `h-11 md:h-9` (44px mobile, 36px desktop)
   - **Screens affected:** All screens

5. **❌ Missing focus traps in modals**
   - Tab key escapes modal, focus goes behind
   - **Fix:** Use RadixUI Dialog (auto-traps focus)
   - **Screens affected:** Task Detail Modal, Idea Detail Slider

### Medium Issues (Should Fix)

6. **⚠️ Table headers missing `scope="col"`**
   - Screen readers can't associate cells with headers
   - **Fix:** Add `scope="col"` to all `<th>` elements
   - **Screens affected:** Ideas Table, Time Audit

7. **⚠️ Form inputs missing error associations**
   - Errors not announced to screen readers
   - **Fix:** Use `aria-invalid` + `aria-describedby`
   - **Screens affected:** Settings forms, quick capture

8. **⚠️ Decorative icons not hidden from screen readers**
   - Status icons in badges, decorative illustrations
   - **Fix:** Add `aria-hidden="true"` to decorative icons
   - **Screens affected:** All screens with icons

---

## 10. Accessibility Quick Reference

### Color Contrast

```tsx
{/* ✅ Compliant text on background */}
<p className="text-foreground">Normal text (4.5:1)</p>
<p className="text-muted-foreground">Muted text (4.5:1)</p>

{/* ✅ White text on primary */}
<Badge className="bg-primary text-white">Label (#FFFFFF on primary)</Badge>

{/* ❌ Avoid var(--text) on accent backgrounds */}
<div className="bg-primary-muted text-foreground"> {/* FAILS */}
```

### Touch Targets

```tsx
{/* ✅ Responsive sizing */}
<Button className="h-11 md:h-9">Click me</Button> {/* 44px mobile */}
<Button size="icon" className="h-11 w-11 md:h-9 md:w-9" /> {/* 44x44 mobile */}

{/* ❌ Too small on mobile */}
<Button className="h-9">Click me</Button> {/* 36px - too small */}
```

### ARIA Labels

```tsx
{/* ✅ Icon button with label */}
<Button variant="ghost" size="icon" aria-label="Open settings">
  <Settings className="h-5 w-5" />
</Button>

{/* ✅ Decorative icon hidden */}
<Lightbulb className="h-5 w-5" aria-hidden="true" />

{/* ✅ Form error association */}
<Input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>
{hasError && <p id="error-message" role="alert">Error text</p>}
```

### Keyboard Navigation

```tsx
{/* ✅ Focus trap in modal (RadixUI auto-handles) */}
<Dialog open={isOpen}>
  <DialogContent> {/* Tab cycles within */}

{/* ✅ Custom element keyboard support */}
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }}
>
```

---

## Related Documentation

- **[Tokens Reference](./tokens.md)** - Color palette, contrast ratios
- **[Components Guide](./components.md)** - Accessible component patterns
- **[Layouts Guide](./layouts.md)** - Touch target sizing, responsive patterns
- **[Design Audit Report](./audit-report.md)** - All accessibility violations found

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

---

**Last Updated:** 2026-01-08
**Status:** Living document - update as patterns evolve
