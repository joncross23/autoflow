# AutoFlow — Setup Guide

This guide explains how to set up the Claude Project (web) and Claude Code (CLI) for seamless collaboration on AutoFlow development.

---

## Step 1: Create GitHub Repository

1. Repository created: `jon-cross/autoflow` ✓
2. Clone locally:
   ```bash
   git clone https://github.com/jon-cross/autoflow.git
   cd autoflow
   ```
3. Copy all bootstrap files into the repository:
   ```
   autoflow/
   ├── CLAUDE.md
   ├── PROJECT_INSTRUCTIONS.md
   ├── docs/
   │   ├── PROJECT_CONTEXT.md
   │   ├── CURRENT_STATE.md
   │   └── backlog/
   │       ├── README.md
   │       ├── project.json
   │       ├── ideas.json
   │       └── schema.json
   ```
4. Initial commit:
   ```bash
   git add -A
   git commit -m "chore: initial project setup with backlog"
   git push origin main
   ```

---

## Step 2: Create Claude Project (Web)

1. Go to [claude.ai](https://claude.ai)
2. Click **Projects** in the sidebar
3. Click **Create Project**
4. Name: `AutoFlow Development`
5. Set up **Project Instructions**:
   - Open `PROJECT_INSTRUCTIONS.md`
   - Copy entire contents
   - Paste into the Instructions field
6. Add **Project Knowledge** files:
   - Click "Add content" → "Upload files"
   - Upload these files:
     - `docs/PROJECT_CONTEXT.md`
     - `docs/CURRENT_STATE.md`
     - `docs/backlog/project.json`
     - `docs/backlog/ideas.json`

---

## Step 3: Set Up Claude Code (CLI)

1. Install Claude Code if not already:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
   
2. Navigate to your repository:
   ```bash
   cd ~/path/to/autoflow
   ```

3. Claude Code automatically reads `CLAUDE.md` from the root

4. Start a session:
   ```bash
   claude
   ```

5. Claude Code now has full context from:
   - `CLAUDE.md` (read automatically)
   - All files in `docs/` (accessible on request)
   - Full filesystem access

---

## Workflow: Keeping Everything in Sync

### After a Claude Project (Web) Session

If you made decisions or want to update documentation:

1. Ask Claude to output updates as markdown
2. Copy the markdown to your local files
3. Commit and push:
   ```bash
   git add docs/CURRENT_STATE.md
   git commit -m "docs: update state after design review"
   git push origin main
   ```
4. Next Claude Code session will see the changes

### After a Claude Code Session

Claude Code commits directly:

1. Claude Code makes changes
2. Claude Code commits:
   ```bash
   git add -A
   git commit -m "feat: implement theme toggle"
   git push origin main
   ```
3. For Claude Project to see changes:
   - Re-upload updated files to Project Knowledge
   - Or pull changes locally and copy relevant updates

### Major Sync Points

Re-upload Project Knowledge files when:
- `CURRENT_STATE.md` changes significantly
- `project.json` has major updates (sprint complete)
- New decisions documented in `docs/decisions/`

---

## Session Protocols

### Starting a Claude Project Session

Say:
> "Check CURRENT_STATE.md in Project Knowledge and confirm the current focus."

Claude will:
1. Read the current state
2. Confirm current phase and sprint
3. Identify next priorities

### Starting a Claude Code Session

Claude Code automatically reads `CLAUDE.md`. Just say:
> "What's the current state of the project?"

Claude will:
1. Read `docs/CURRENT_STATE.md`
2. Report current progress
3. Suggest next actions

### Ending Any Session

Ask:
> "Summarise what we accomplished and provide updates for CURRENT_STATE.md"

Copy the output and commit:
```bash
git add docs/CURRENT_STATE.md
git commit -m "docs: update state after [session description]"
git push
```

---

## File Responsibilities

| File | Who Updates | When |
|------|-------------|------|
| `CLAUDE.md` | Developer | Project setup, major architecture changes |
| `PROJECT_INSTRUCTIONS.md` | Developer | Project scope changes |
| `PROJECT_CONTEXT.md` | Developer | Feature spec changes |
| `CURRENT_STATE.md` | Claude + Developer | Every session |
| `backlog/project.json` | Claude + Developer | Task progress |
| `backlog/ideas.json` | Claude + Developer | New ideas captured |
| `decisions/*.md` | Claude + Developer | Architecture decisions |
| `sprints/*.md` | Developer | Sprint planning |

---

## Tips

### Use Artifacts for Mockups
In Claude Project, ask for mockups as artifacts. They're interactive and demonstrate the design.

### Reference Past Work
Both environments can reference previous sessions via:
- `CURRENT_STATE.md` session log
- Git commit history
- Chat history (Claude Project remembers within project)

### Keep CURRENT_STATE.md Small
This file is read every session. Keep it focused on:
- Current phase and sprint
- What's in progress
- What's blocked
- Next immediate steps

Archive completed work to sprint retrospectives.

### JSON Backlog as Source of Truth
`project.json` is the authoritative list of tasks. When in doubt:
```bash
cat docs/backlog/project.json | jq '.cards | map(select(.columnId == "sprint")) | .[].title'
```

---

## Troubleshooting

### Claude Code doesn't see updates
Make sure you:
1. Committed changes: `git status`
2. Pushed to remote: `git push`
3. Are in the correct directory

### Claude Project seems outdated
Re-upload the changed files to Project Knowledge:
1. Open Project settings
2. Remove old file version
3. Upload new version

### Conflicting information
`CURRENT_STATE.md` is the tiebreaker for current focus. If project.json and CURRENT_STATE conflict, update whichever is outdated.

---

## Quick Reference

### Claude Project URL
`https://claude.ai/project/[YOUR_PROJECT_ID]`

### Key Commands

```bash
# Check current sprint
cat docs/backlog/project.json | jq '.cards | map(select(.columnId == "sprint"))'

# Update and push state
git add docs/CURRENT_STATE.md && git commit -m "docs: update state" && git push

# Start Claude Code
cd ~/autoflow && claude
```

---

Ready to start? Head to Claude Project and begin the Design Sprint!
