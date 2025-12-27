# iOS UX Improvements Sprint

**Branch:** `feature/ios-ux-improvements`
**Target Device:** iPhone 15 Pro Max (430×932pt @ 3x)
**Created:** 2025-12-27

---

## Executive Summary

This sprint focuses on optimising AutoFlow for iOS devices, particularly the iPhone 15 Pro Max. Key areas include:

1. **iOS-specific UI optimisations** - Safe areas, touch targets, viewport handling
2. **UX improvements** - Single-tap task opening, smoother drag-drop
3. **Reading & Watch Lists** - New content capture paradigm
4. **Quick Link Capture** - URL detection and metadata extraction

---

## 1. iOS UI Optimisations

### 1.1 Safe Area Handling

**Current State:** Mobile bottom nav uses `fixed bottom-0` but doesn't account for:
- Home indicator (34pt on Face ID devices)
- Dynamic Island (top safe area)
- Landscape orientations

**Implementation:**

```css
/* globals.css additions */
@supports (padding: max(0px)) {
  .ios-safe-bottom {
    padding-bottom: max(env(safe-area-inset-bottom), 16px);
  }

  .ios-safe-top {
    padding-top: max(env(safe-area-inset-top), 0px);
  }
}

/* Bottom navigation enhancement */
.mobile-nav {
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}
```

**Files to Update:**
- `src/app/globals.css` - Add iOS safe area utilities
- `src/components/layout/Sidebar.tsx` - Apply to mobile bottom nav
- `src/app/layout.tsx` - Ensure viewport meta is correct

### 1.2 Touch Target Sizing

**iOS HIG Minimum:** 44×44pt touch targets

**Current Issues:**
- Some buttons use `p-1` (8px) or `p-1.5` (12px)
- Filter chips may be too small
- Drag handle is only visible on hover (not ideal for touch)

**Implementation:**
- Create `touch-target` utility class (min 44×44pt)
- Update TaskCard footer icons
- Make drag handle always visible on mobile
- Increase filter chip heights

### 1.3 Viewport & Scroll Behaviour

**Current `layout.tsx`:**
```tsx
viewport: {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
},
```

**Enhancements needed:**
- Add `viewport-fit=cover` for edge-to-edge design
- Consider `user-scalable=no` for app-like feel (accessibility trade-off)
- Add `-webkit-overflow-scrolling: touch` for momentum scrolling

---

## 2. UX Improvements

### 2.1 Single-Tap Task Opening

**Current Behaviour:**
- `TaskCard` has `onClick={() => onClick?.(task)}` on the entire card ✓
- Checkbox and drag handle have `e.stopPropagation()` ✓

**Issue:** On touch devices, drag detection may interfere with taps

**Solution:**
```tsx
// In TaskCard - Add touch-specific handling
const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!touchStart) return;
  const dx = Math.abs(e.changedTouches[0].clientX - touchStart.x);
  const dy = Math.abs(e.changedTouches[0].clientY - touchStart.y);
  // Only trigger click if movement is minimal (tap, not drag)
  if (dx < 10 && dy < 10) {
    onClick?.(task);
  }
  setTouchStart(null);
};
```

**Alternative:** Configure `@dnd-kit` with `activationConstraint` for touch:
```tsx
useSensor(TouchSensor, {
  activationConstraint: {
    delay: 200, // ms before drag starts
    tolerance: 5, // px movement allowed
  },
});
```

### 2.2 Mobile-First Modal Behaviour

**Current:** TaskDetailModal uses fixed positioning with transform centering

**Enhancement for iOS:**
- Use bottom sheet pattern on mobile (slide up from bottom)
- Add swipe-down-to-dismiss gesture
- Respect safe areas within modal

```tsx
// Mobile bottom sheet pattern
<div className={cn(
  "fixed inset-x-0 z-50 transition-transform duration-300",
  // Desktop: centered modal
  "md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
  // Mobile: bottom sheet
  "bottom-0 rounded-t-2xl max-h-[90vh]"
)}>
```

---

## 3. Reading & Watch Lists

### 3.1 Concept: Content Categories via Themes

**Option A: Extend Themes System**
- Create system-level themes: "📖 To Read", "🎬 To Watch", "🎧 To Listen"
- Users can filter Ideas by these themes
- Leverages existing `idea_themes` junction table

**Option B: New Idea Type Field**
- Add `idea_type` enum: `automation | reading | watching | listening`
- Separate views for each type
- More rigid but clearer separation

**Option C: Dedicated "Inbox" Entity** (Recommended)
- New lightweight entity for quick captures
- Fields: `title`, `url`, `type`, `notes`, `processed` (bool)
- Triage flow: Inbox → Idea (or archive)

### 3.2 Recommended Implementation: Enhanced Themes + Quick Save

**Phase 1: System Themes**
```sql
-- Migration to add system themes
INSERT INTO themes (id, user_id, name, color, is_system) VALUES
  (gen_random_uuid(), NULL, '📖 To Read', '#3B82F6', true),
  (gen_random_uuid(), NULL, '🎬 To Watch', '#EF4444', true),
  (gen_random_uuid(), NULL, '🎧 To Listen', '#22C55E', true);
```

**Phase 2: Quick Save Modal**
New component for rapid content capture:
```
┌─────────────────────────────────────────┐
│  Save Content                        ✕  │
├─────────────────────────────────────────┤
│  [https://example.com/article]          │
│                                         │
│  📖 To Read  🎬 To Watch  🎧 To Listen  │
│                                         │
│  [Optional notes...]                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Save to Inbox               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3.3 Views for Reading/Watch Lists

**Dashboard Widgets:**
- "Reading Queue" - Ideas with "To Read" theme
- "Watch Later" - Ideas with "To Watch" theme

**Dedicated List View:**
- Simple card list (not Kanban)
- Swipe to archive/complete
- Progress tracking (read/watched count)

---

## 4. Quick Link Capture Enhancement

### 4.1 URL Detection in Quick Capture

**Current:** QuickCapture accepts plain text title only

**Enhancement:**
```tsx
// Detect if input is a URL
const isUrl = (text: string) => {
  try {
    new URL(text.startsWith('http') ? text : `https://${text}`);
    return text.includes('.') && !text.includes(' ');
  } catch {
    return false;
  }
};

// In handleSubmit:
if (isUrl(title)) {
  // Show link capture UI instead of plain idea
  setShowLinkCapture(true);
  setDetectedUrl(normaliseUrl(title));
  return;
}
```

### 4.2 Automatic Metadata Extraction

**API Route:** `/api/links/metadata`
```tsx
// Extract title, description, favicon from URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // Fetch page and parse Open Graph / meta tags
  const response = await fetch(url);
  const html = await response.text();

  // Parse with cheerio or similar
  const title = extractOgTitle(html) || extractMetaTitle(html);
  const description = extractOgDescription(html);
  const favicon = extractFavicon(html, url);

  return Response.json({ title, description, favicon });
}
```

### 4.3 Enhanced QuickCapture UI

**When URL detected:**
```
┌─────────────────────────────────────────────────────┐
│ 💡 Quick Capture                         Cmd/Ctrl+K │
├─────────────────────────────────────────────────────┤
│ 🔗 URL detected:                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📰 Article Title (auto-fetched)                 │ │
│ │ example.com                                     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Category:  ○ Idea  ● Read  ○ Watch  ○ Listen       │
│                                                     │
│ [Add note (optional)...]                           │
│                                                     │
│                        [ Cancel ]  [ Save Link 📎 ] │
└─────────────────────────────────────────────────────┘
```

### 4.4 Share Sheet Integration (PWA)

**manifest.json enhancement:**
```json
{
  "share_target": {
    "action": "/api/share",
    "method": "POST",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

This enables "Share to AutoFlow" from Safari and other iOS apps.

---

## 5. Implementation Priority

### Phase 1: iOS Polish (Quick Wins)
1. ✅ Safe area CSS utilities
2. ✅ Touch target sizing
3. ✅ Viewport meta updates
4. ✅ Drag delay for touch devices

### Phase 2: UX Enhancements
1. TaskCard touch handling
2. Mobile bottom sheet modals
3. Swipe gestures

### Phase 3: Content Capture
1. System themes for Read/Watch/Listen
2. URL detection in QuickCapture
3. Metadata extraction API
4. Enhanced capture UI

### Phase 4: PWA Features
1. Share target manifest
2. Offline quick capture queue
3. Background sync

---

## 6. Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/globals.css` | Modify | iOS safe area utilities |
| `src/components/layout/Sidebar.tsx` | Modify | Bottom nav safe areas |
| `src/components/projects/TaskCard.tsx` | Modify | Touch handling |
| `src/components/projects/TaskKanbanBoard.tsx` | Modify | Touch sensor config |
| `src/components/ideas/QuickCapture.tsx` | Modify | URL detection |
| `src/components/ideas/LinkCapturePanel.tsx` | Create | URL capture UI |
| `src/app/api/links/metadata/route.ts` | Create | URL metadata API |
| `src/hooks/useUrlMetadata.ts` | Create | Metadata fetching hook |
| `public/manifest.json` | Modify | Share target config |

---

## 7. Success Metrics

- **Touch accuracy:** < 5% mis-taps on task cards
- **Time to capture link:** < 5 seconds from paste to save
- **Reading list usage:** Track theme assignment rate
- **PWA share usage:** Track share target invocations

---

## 8. Design Mockup References

These features align with existing mockups:
- `docs/mockups/mobile-views.jsx` - Mobile layout patterns
- `docs/mockups/card-detail-modal.jsx` - Modal behaviour
- `docs/mockups/questionnaire-form.jsx` - Form patterns

---

*Sprint created: 2025-12-27*
*Target: iPhone 15 Pro Max (iOS 17+)*
