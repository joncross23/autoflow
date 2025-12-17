# AutoFlow

**AI & Automation Discovery Platform**

> Capture Fast. Evaluate Deep. Execute Systematically.

AutoFlow helps businesses identify, evaluate, and implement automation opportunities through:

- **Rapid Idea Capture** — Quick text entry, voice capture, shareable questionnaires
- **AI Evaluation** — Automatic scoring of complexity, value, and ROI
- **Trello-Style Tracking** — Kanban boards with rich cards and drag-drop
- **Impact Dashboards** — Visualise time saved and value recovered

---

## Status

**Phase 0: Foundation** — Development infrastructure complete

See [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) for current progress.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Anthropic Claude API |
| Styling | Tailwind CSS + shadcn/ui |
| Drag & Drop | dnd-kit |
| Deployment | Vercel |

---

## Quick Start

```bash
# Clone
git clone https://github.com/jon-cross/autoflow.git
cd autoflow

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run test         # Run tests with Vitest
npm run type-check   # TypeScript type checking
```

---

## Project Structure

```
autoflow/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard routes
│   │   └── settings/     # Settings page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components (Sidebar)
│   │   └── theme/        # Theme system (Provider, Toggle)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   └── types/            # TypeScript type definitions
├── docs/                 # Documentation
│   ├── mockups/          # Design mockups from Phase 0.5
│   ├── backlog/          # Structured task backlog
│   └── decisions/        # Architecture Decision Records
└── public/               # Static assets
```

---

## Theme System

AutoFlow includes a built-in theme system with:

- **Mode**: Dark (default) | Light | System
- **Accent colours**: Midnight Blue, Emerald Green, Sunset Orange, Royal Purple, Rose Pink, Slate Grey

Access via Settings page or use `Cmd/Ctrl + B` to toggle sidebar.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Full specification |
| [CURRENT_STATE.md](docs/CURRENT_STATE.md) | Current progress & next steps |
| [backlog/](docs/backlog/) | Structured task backlog |
| [decisions/](docs/decisions/) | Architecture Decision Records |

---

## Development Phases

- [x] **Phase 0.5**: Design Sprint — Mockups complete
- [x] **Phase 0**: Foundation — Infrastructure setup
- [ ] **Phase 1**: Theme Implementation
- [ ] **Phase 2**: Authentication
- [ ] **Phase 3**: Idea Capture
- [ ] **Phase 4**: AI Evaluation
- [ ] **Phase 5**: Kanban Board
- [ ] **Phase 6**: Questionnaires
- [ ] **Phase 7**: Dashboards
- [ ] **Phase 8**: Polish & PWA

---

## License

Private — Me Learning Ltd
