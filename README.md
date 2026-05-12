# Personal Project Management Dashboard

A self-hosted, single-user project management dashboard. Track projects, tasks, milestones, and a Gantt-style timeline. All data is stored locally in SQLite.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui**
- **SQLite** via **better-sqlite3** + **Drizzle ORM**
- **Vitest** + **React Testing Library** for unit tests
- **Playwright** for end-to-end tests
- **ESLint** + **Prettier**

## Getting started

```bash
npm install
npm run db:migrate     # create local SQLite DB at ./data/dashboard.db
npm run dev            # http://localhost:3000
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Format with Prettier |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest one-shot |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run db:generate` | Generate a new Drizzle migration from the schema |
| `npm run db:migrate` | Apply pending migrations to the SQLite DB |
| `npm run db:studio` | Open Drizzle Studio |

## Environment

- `DATABASE_URL` — SQLite file path (e.g., `file:./data/dashboard.db`). Defaults to `./data/dashboard.db` when unset.

## Layout

```
src/
  app/
    (dashboard)/         # Main UI route group (sidebar layout)
      projects/          # Projects list + detail
      timeline/          # Gantt timeline
  components/            # UI + feature components
  lib/
    actions/             # "use server" entry points called from the UI
    db/                  # Drizzle client, schema, migrations
    services/            # Domain logic, only layer that touches the DB
    validators/          # Zod schemas (shared client + server)
data/                    # SQLite file (gitignored)
e2e/                     # Playwright specs
```

See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for the architecture and conventions used across the codebase.
