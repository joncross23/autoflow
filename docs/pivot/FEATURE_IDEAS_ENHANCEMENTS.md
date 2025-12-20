# Feature: Add Labels, Attachments, and Links to Ideas

**Priority:** Phase 1 (Labels) → Phase 2 (Attachments & Links)  
**Status:** Ready for implementation  
**Created:** December 2024

---

## Context

We have an Ideas Slider panel that displays idea details. We need to add three new sections that also display as columns in the Ideas Table. These features bring Ideas closer to feature parity with typical project management tools while maintaining our table-first approach.

**Current Slider Sections:**
- Status/Title/Meta
- Description
- RICE Score
- Tasks
- AI Evaluation
- Comments
- Activity

**New Sections to Add:**
- Labels
- Attachments
- Links

---

## Data Model Changes

```sql
-- Labels (reusable across ideas)
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,  -- Hex color e.g. '#3B82F6'
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Idea-Label junction
CREATE TABLE idea_labels (
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (idea_id, label_id)
);

-- Attachments
CREATE TABLE idea_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,        -- Supabase Storage path
  file_type TEXT,                 -- MIME type
  file_size INTEGER,              -- Bytes
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links
CREATE TABLE idea_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,                     -- User-provided or fetched
  favicon TEXT,                   -- Emoji or URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_idea_labels_idea_id ON idea_labels(idea_id);
CREATE INDEX idx_idea_labels_label_id ON idea_labels(label_id);
CREATE INDEX idx_idea_attachments_idea_id ON idea_attachments(idea_id);
CREATE INDEX idx_idea_links_idea_id ON idea_links(idea_id);
CREATE INDEX idx_labels_user_id ON labels(user_id);
```

---

## UI Requirements

### 1. Labels Section (in Idea Slider)

**Display:**
```
🏷️ Labels                                    [+ Add]
[Zapier] [Email] [Quick Win]
```

**Behaviour:**
- Clicking "+ Add" opens dropdown of existing labels + "Create new" option
- Labels display as coloured chips with background opacity
- Hover on label shows × icon to remove
- Click × to remove label from idea (not delete the label)

**Create Label Modal:**
```
┌─────────────────────────────────────────┐
│ Create Label                        [×] │
├─────────────────────────────────────────┤
│                                         │
│ Name                                    │
│ [                                     ] │
│                                         │
│ Colour                                  │
│ [●] [●] [●] [●] [●] [●] [●] [●]       │
│                                         │
│              [Cancel] [Create]          │
└─────────────────────────────────────────┘
```

**Colour Options (8 presets):**
```javascript
const labelColors = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];
```

**Label Chip Component:**
```jsx
<span 
  className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
  style={{ 
    backgroundColor: label.color + '20', 
    color: label.color 
  }}
>
  {label.name}
  {onRemove && (
    <button onClick={onRemove} className="hover:opacity-70">
      <X className="w-3 h-3" />
    </button>
  )}
</span>
```

---

### 2. Attachments Section (in Idea Slider)

**Display:**
```
📎 Attachments (2)                           [+ Add]
┌────────────────────────────────────────────────┐
│ [📄] requirements-spec.pdf    1.2 MB  Dec 17  │
│ [🖼️] workflow-mockup.png      245 KB  Dec 18  │
└────────────────────────────────────────────────┘
```

**Behaviour:**
- "+ Add" button opens file picker
- Support drag-and-drop onto section
- Show upload progress indicator
- Click attachment to download/preview
- Hover shows delete button (trash icon)
- Confirm before delete

**File Type Icons:**
```javascript
const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return '📊';
  if (mimeType?.includes('document') || mimeType?.includes('word')) return '📝';
  if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return '📽️';
  if (mimeType?.startsWith('video/')) return '🎬';
  if (mimeType?.startsWith('audio/')) return '🎵';
  return '📁';
};
```

**File Size Formatting:**
```javascript
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
```

**Supabase Storage Setup:**
- Bucket name: `idea-attachments`
- Path pattern: `{user_id}/{idea_id}/{filename}`
- Max file size: 10MB
- Allowed types: images, PDFs, documents, spreadsheets

---

### 3. Links Section (in Idea Slider)

**Display:**
```
🔗 Links (2)                                 [+ Add]
┌────────────────────────────────────────────────┐
│ ⚡ Zapier Dashboard                            │
│    https://zapier.com/app/zaps                │
│ 📘 Xero API Documentation                     │
│    https://developer.xero.com/docs            │
└────────────────────────────────────────────────┘
```

**Behaviour:**
- "+ Add" opens modal with URL input
- Auto-fetch page title if title field left empty (nice-to-have, can be Phase 2)
- Click link opens in new tab
- Hover shows edit and delete buttons
- Default favicon is 🔗, user can select emoji

**Add Link Modal:**
```
┌─────────────────────────────────────────┐
│ Add Link                            [×] │
├─────────────────────────────────────────┤
│                                         │
│ URL *                                   │
│ [https://                             ] │
│                                         │
│ Title (optional)                        │
│ [                                     ] │
│                                         │
│ Icon                                    │
│ [🔗] [📘] [📊] [⚡] [📧] [💡] [🎯] [📁] │
│                                         │
│              [Cancel] [Add Link]        │
└─────────────────────────────────────────┘
```

---

### 4. Ideas Table Columns

Add optional columns to the Ideas Table view:

| Column | Header | Display | Width | Sortable |
|--------|--------|---------|-------|----------|
| Labels | Labels | Up to 3 chips, then "+N" badge | 150px | No |
| Attachments | 📎 | Count badge: `3` | 50px | Yes |
| Links | 🔗 | Count badge: `2` | 50px | Yes |

**Labels Column Behaviour:**
- Show first 3 labels as small chips
- If more than 3, show "+N" badge
- Click opens slider to Labels section
- Chips are clickable to filter table by that label

**Count Column Behaviour:**
- Show count number
- Click opens slider to that section
- Zero shows as `—` or empty

**Column Visibility:**
- Add to column toggle dropdown
- Default: Labels visible, Attachments and Links hidden
- Persist preference in localStorage

---

## Section Order in Slider

Update the Idea Slider to display sections in this order:

1. Header (Status, Title, Actions)
2. Meta Grid (Effort, Horizon, Owner, Dates)
3. Description
4. **Labels** ← NEW
5. RICE Score
6. Tasks
7. AI Evaluation
8. **Attachments** ← NEW
9. **Links** ← NEW
10. Comments
11. Activity

---

## API Routes

### Labels

```
GET    /api/labels              - List user's labels
POST   /api/labels              - Create label
PATCH  /api/labels/:id          - Update label
DELETE /api/labels/:id          - Delete label

POST   /api/ideas/:id/labels    - Add label to idea
DELETE /api/ideas/:id/labels/:labelId - Remove label from idea
```

### Attachments

```
GET    /api/ideas/:id/attachments     - List idea attachments
POST   /api/ideas/:id/attachments     - Upload attachment
DELETE /api/ideas/:id/attachments/:id - Delete attachment
```

### Links

```
GET    /api/ideas/:id/links     - List idea links
POST   /api/ideas/:id/links     - Add link
PATCH  /api/ideas/:id/links/:id - Update link
DELETE /api/ideas/:id/links/:id - Delete link
```

---

## Styling Guidelines

- Follow existing slider section patterns
- Use cyan accent colour for interactive elements:
  - `text-cyan-400` for section icons
  - `bg-cyan-500/20` for hover states
  - `border-cyan-500` for focus states
- Dark mode styling consistent with rest of app
- Section headers format: `[Icon] Title (count)` + `[+ Add]` button right-aligned

**Section Header Component Pattern:**
```jsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
    <Icon className="w-4 h-4 text-zinc-500" />
    {title}
    {count !== undefined && (
      <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
        {count}
      </span>
    )}
  </div>
  {onAdd && (
    <button 
      onClick={onAdd}
      className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
    >
      <Plus className="w-3 h-3" />
      Add
    </button>
  )}
</div>
```

---

## File Locations

| File | Changes |
|------|---------|
| `supabase/migrations/xxx_add_labels_attachments_links.sql` | Database schema |
| `src/components/ideas/IdeaSlider.tsx` | Add new sections |
| `src/components/ideas/IdeasTable.tsx` | Add new columns |
| `src/components/ideas/LabelsSection.tsx` | New component |
| `src/components/ideas/AttachmentsSection.tsx` | New component |
| `src/components/ideas/LinksSection.tsx` | New component |
| `src/components/ui/LabelBadge.tsx` | Reusable label chip |
| `src/components/modals/CreateLabelModal.tsx` | New modal |
| `src/components/modals/AddLinkModal.tsx` | New modal |
| `src/lib/api/labels.ts` | Label API functions |
| `src/lib/api/attachments.ts` | Attachment API functions |
| `src/lib/api/links.ts` | Link API functions |
| `src/hooks/useLabels.ts` | Label state management |

---

## Implementation Phases

### Phase 1: Labels
1. Database migration
2. Labels API routes
3. LabelsSection component
4. CreateLabelModal component
5. LabelBadge component
6. Add to IdeaSlider
7. Add Labels column to IdeasTable
8. Label filtering in table

### Phase 2: Attachments
1. Database migration
2. Supabase Storage bucket setup
3. Attachments API routes
4. AttachmentsSection component
5. File upload with progress
6. Add to IdeaSlider
7. Add Attachments column to IdeasTable

### Phase 3: Links
1. Database migration
2. Links API routes
3. LinksSection component
4. AddLinkModal component
5. Add to IdeaSlider
6. Add Links column to IdeasTable

---

## Acceptance Criteria

### Labels
- [ ] User can create labels with name and colour
- [ ] User can add/remove labels from ideas
- [ ] Labels display in slider with coloured chips
- [ ] Labels column shows in Ideas Table (toggleable)
- [ ] Can filter Ideas Table by label
- [ ] Labels persist across sessions

### Attachments
- [ ] User can upload files up to 10MB
- [ ] Drag-and-drop upload works
- [ ] Upload progress indicator shows
- [ ] Files display with appropriate icon
- [ ] Click to download works
- [ ] Delete with confirmation works
- [ ] Attachments count shows in table

### Links
- [ ] User can add links with URL and optional title
- [ ] Links display with favicon/emoji
- [ ] Click opens in new tab
- [ ] Edit and delete work
- [ ] Links count shows in table

---

## Open Questions

1. **Label management UI**: Should there be a dedicated "Manage Labels" page, or just inline editing?
2. **Attachment preview**: Inline preview for images/PDFs, or always download?
3. **Link metadata**: Auto-fetch title and favicon from URL? (adds complexity)
4. **Bulk operations**: Add labels to multiple ideas at once?

---

*Document ready for Claude Code implementation*
