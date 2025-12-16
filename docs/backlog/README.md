# AutoFlow Backlog

This directory contains the structured backlog for AutoFlow development. These files serve dual purposes:

1. **Now:** Human-readable project tracking before the app exists
2. **Later:** First import when bulk import feature is built (eating our own dog food)

---

## Files

| File | Purpose |
|------|---------|
| `project.json` | Main project with columns and cards (tasks) |
| `ideas.json` | Future enhancement ideas not yet converted to tasks |
| `schema.json` | JSON Schema for validation |

---

## Working with the Backlog

### Viewing Progress

The `project.json` file contains:
- **columns:** Kanban columns (Backlog, Current Sprint, In Progress, Review, Done)
- **cards:** All tasks with checklists, labels, and AI evaluations

To see current sprint items:
```bash
cat project.json | jq '.cards | map(select(.columnId == "sprint"))'
```

### Updating Task Status

1. Find the card by ID (e.g., `AF-001`)
2. Change `columnId` to new column
3. Update `order` if needed
4. Commit changes

### Adding New Tasks

1. Generate next ID: `AF-XXX`
2. Add card object to `cards` array
3. Include required fields: `id`, `title`, `columnId`, `order`, `createdAt`
4. Optional: Add checklists, labels, aiEvaluation

### Marking Checklist Items Done

Update `done: true` for completed items:
```json
{ "id": "cli-001", "text": "Define CSS custom properties", "done": true }
```

---

## Card ID Convention

| Prefix | Type |
|--------|------|
| `AF-XXX` | Project tasks (AutoFlow) |
| `IDEA-XXX` | Ideas not yet converted |
| `cl-XXX` | Checklist ID |
| `cli-XXX` | Checklist item ID |

---

## Labels

Current labels in use:

| Label | Meaning |
|-------|---------|
| `phase-0.5` | Design Sprint |
| `phase-0` | Foundation |
| `phase-1` | Theme Implementation |
| `phase-2` | Authentication |
| `phase-3` | Idea Capture |
| `phase-4` | AI Evaluation |
| `phase-5` | Kanban Board |
| `phase-6` | Questionnaires |
| `phase-7` | Dashboards |
| `phase-8` | Polish & PWA |
| `design` | Design work |
| `mockup` | Visual mockup |
| `infrastructure` | Setup/config |
| `feature` | New feature |
| `ui` | User interface |
| `critical` | Must-have |
| `ai` | AI integration |
| `mobile` | Mobile-specific |

---

## Priority Levels

| Priority | Meaning |
|----------|---------|
| `critical` | Must be done, blocks other work |
| `high` | Important for phase completion |
| `medium` | Should do, but not blocking |
| `low` | Nice to have |

---

## Sync with App

Once AutoFlow has bulk import:

1. Export `project.json`
2. Use Import feature
3. Continue tracking in the app
4. Periodically export back to repo for backup

---

## Validation

To validate against schema (requires `ajv-cli`):

```bash
npx ajv validate -s schema.json -d project.json
```

Or use VS Code with JSON Schema extension.
