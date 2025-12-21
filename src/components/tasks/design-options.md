# Delivery Board Design Options

## Current Problem
The current design has poor contrast between three layers:
- Page background: `--bg` (#0A0A0B in dark)
- Column background: `bg-secondary/50` (~#131316 at 50%)
- Card background: `bg-secondary` (#131316)

The difference is only ~5-10 brightness units between layers.

## Design Principles
1. **Minimum contrast**: 15-20 brightness units between adjacent layers
2. **Elevation = Lightness** (dark mode): Higher elements should be lighter
3. **Elevation = Lightness** (light mode): Higher elements should be lighter (use shadows for depth)
4. **Use existing CSS variables** for maintainability

---

## Design Option 1: "Elevated Cards" (Recommended)
Cards are the brightest element, columns are subtle containers.

### Dark Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg` | #0A0A0B | Darkest - canvas |
| Columns | `--bg-secondary` | #131316 | Subtle container |
| Cards | `--bg-elevated` | #1F1F26 | Clearly elevated |

### Light Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg-tertiary` | #E4E4E7 | Light gray canvas |
| Columns | `--bg-secondary` | #F4F4F5 | Slightly lighter |
| Cards | `--bg-elevated` | #FFFFFF | White with shadow |

### Implementation
```tsx
// Page: bg-bg (already default)
// Column: bg-bg-secondary (solid, not transparent)
// Card: bg-bg-elevated + subtle shadow
```

---

## Design Option 2: "Sunken Columns"
Columns are recessed/darker than the page, cards pop out.

### Dark Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg-secondary` | #131316 | Medium base |
| Columns | `--bg` | #0A0A0B | Sunken/recessed |
| Cards | `--bg-tertiary` | #1A1A1F | Elevated |

### Light Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg` | #FAFAFA | Clean base |
| Columns | `--bg-tertiary` | #E4E4E7 | Recessed |
| Cards | `--bg-elevated` | #FFFFFF | Elevated |

### Implementation
```tsx
// Page: bg-bg-secondary
// Column: bg-bg (sunken)
// Card: bg-bg-tertiary
```

---

## Design Option 3: "Floating Cards with Shadows"
Columns are transparent, cards float with shadows.

### Dark Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg` | #0A0A0B | Dark canvas |
| Columns | transparent | - | No bg, just header |
| Cards | `--bg-secondary` | #131316 | + shadow |

### Light Mode
| Layer | Variable | Hex | Description |
|-------|----------|-----|-------------|
| Page | `--bg` | #FAFAFA | Light canvas |
| Columns | transparent | - | No bg, just header |
| Cards | `--bg-elevated` | #FFFFFF | + shadow |

### Implementation
```tsx
// Page: bg-bg
// Column: bg-transparent (only header has border-bottom)
// Card: bg-bg-secondary + shadow-md
```

---

## Recommendation

**Option 1 (Elevated Cards)** is recommended because:
1. Follows Material Design elevation principles
2. Works consistently in both light and dark modes
3. Uses existing CSS variables (no new values needed)
4. Cards being brightest draws attention to the content
5. Columns provide subtle visual grouping without competing
