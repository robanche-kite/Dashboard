# Copilot Instructions — Personal PM Dashboard

Self-hosted, single-user project management dashboard. Tracks projects, tasks, milestones, and a Gantt timeline. All data is stored locally in SQLite.

## Stack

- **Next.js 16** (App Router, Turbopack default) + **React 19** + **TypeScript** strict
- **Tailwind CSS v4** (CSS-first config — see `src/app/globals.css`; **no `tailwind.config.js`**)
- **shadcn/ui** components in `src/components/ui/` — these wrap **`@base-ui/react`** (NOT Radix). API differs: e.g., `<DialogTrigger render={<Button />}>...` instead of `asChild`
- **SQLite** via **`better-sqlite3`** (synchronous) + **Drizzle ORM** + `drizzle-kit` for migrations
- **Zod v4** for validation (note: chained `.optional().or(z.literal("").transform(...))` does NOT coerce `""` to `undefined` — use `z.preprocess` instead; see `src/lib/validators/project.ts`)
- **react-hook-form** + `@hookform/resolvers` for client-side form validation when needed
- **Vitest** + **React Testing Library** + **jsdom** for unit/component tests
- **Playwright** for end-to-end tests (config spins up `npm run dev` against `data/test.db`)
- **ESLint** (`next/core-web-vitals` + `next/typescript`) + **Prettier** with `prettier-plugin-tailwindcss`
- **npm** is the package manager

> ⚠️ Next.js 16 has breaking changes from 14/15. When unsure of an API, check `node_modules/next/dist/docs/01-app/` before writing code. Notable: `next dev` no longer takes `--turbo` (Turbopack is default), `refresh()` from `next/cache` is new, dynamic route `params` is now a `Promise` (`await params`).

## Commands

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Production build | `npm run build` |
| Start production | `npm start` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Format | `npm run format` (check: `npm run format:check`) |
| Unit tests (watch) | `npm test` |
| Unit tests (CI) | `npm run test:run` |
| Single unit test | `npx vitest run path/to/file.test.ts -t "test name"` |
| E2E tests | `npm run e2e` |
| Single E2E test | `npx playwright test e2e/spec.ts -g "test name"` |
| Generate migration | `npm run db:generate` (after editing `src/lib/db/schema.ts`) |
| Apply migrations | `npm run db:migrate` |
| Drizzle Studio | `npm run db:studio` |

Pre-merge sanity check: `npm run lint && npm run typecheck && npm run test:run && npm run build`.

## Architecture

```
src/
  app/
    layout.tsx               # Root layout: fonts + <Toaster />
    page.tsx                 # redirects to /projects
    (dashboard)/             # Route group with sidebar layout
      layout.tsx             # Sidebar + main content
      projects/page.tsx      # Project list + create dialog
      projects/[id]/page.tsx # Project detail (params is async)
      timeline/page.tsx      # Gantt across all projects
  components/
    ui/                      # shadcn/ui primitives — do not hand-edit
    projects/, tasks/, milestones/, gantt/   # Feature components ("use client")
  lib/
    db/
      client.ts              # better-sqlite3 + Drizzle singleton (WAL, FK on)
      schema.ts              # Drizzle tables — single source of truth
      migrations/            # Generated SQL — commit, never hand-edit
      migrate.ts             # tsx script run by `npm run db:migrate`
    services/                # Domain logic; ONLY layer that touches Drizzle
    validators/              # Zod schemas — shared by actions, services, forms
    actions/                 # "use server" entry points called from the UI
    utils.ts                 # cn() helper from shadcn
data/                        # SQLite file (gitignored)
e2e/                         # Playwright specs
```

### Layering rules (enforced by convention)

1. **UI components never import from `lib/db/*` or `lib/services/*` directly.** They call **server actions** in `lib/actions/*`, which call **services**.
2. **Only `lib/services/*` and `lib/db/migrate.ts` touch Drizzle.**
3. **Validators are shared.** Define a Zod schema once in `lib/validators/`, use it in actions for `safeParse(Object.fromEntries(formData))` and in client forms via `@hookform/resolvers/zod` if you need real-time validation.
4. **Schema is the source of truth for types.** Use `typeof table.$inferSelect` / `$inferInsert` from `schema.ts`. Do not hand-write parallel interfaces.

### Server actions pattern

All actions return either `{ ok: true, data }` or `{ ok: false, error, fieldErrors? }` (`ActionResult<T>` in `lib/actions/projects.ts`). Client components handle the result with `useTransition` + `sonner` toasts and call `router.refresh()` on success. Mutations call `revalidatePath(...)` for any pages they affect.

### Database

- **Connection**: `lib/db/client.ts` exports a module-level singleton, cached on `globalThis.__dashboardDb` to survive Next.js dev hot-reload. WAL + foreign keys are enabled at connection time.
- **Path**: from `DATABASE_URL` (e.g., `file:./data/dashboard.db`); defaults to `./data/dashboard.db`. The `data/` directory is auto-created and gitignored.
- **Dates**: stored as ISO 8601 strings in `text` columns (no native SQLite date type). Date-only values use `YYYY-MM-DD`; timestamps use full ISO via `new Date().toISOString()`.
- **IDs**: 12-char `nanoid` strings, generated in the service layer. No autoincrement integers.
- **Migrations**: edit `schema.ts` → `npm run db:generate` → commit the generated SQL → `npm run db:migrate`. Never hand-edit files in `lib/db/migrations/`.
- **Cascades**: `projects → tasks` and `projects → milestones` use `onDelete: "cascade"`.

### Testing

- Unit tests live next to source: `foo.ts` → `foo.test.ts`. Vitest setup is `vitest.setup.ts` (jest-dom matchers).
- E2E specs live in `e2e/` and run against a separate `data/test.db` via `playwright.config.ts`.
- Vitest cannot render `async` Server Components (React limitation) — use Playwright for full-page coverage.

## Conventions

- **TypeScript strict**, no `any`.
- **Path alias**: `@/*` → `src/*`.
- **Components default to server**. Add `"use client"` only when needed (state, effects, event handlers, browser APIs). Keep client components small and leaf-ish.
- **shadcn/ui**: add components with `npx shadcn@latest add <name>`. Note this stack uses `@base-ui/react` under the hood (selected by shadcn's `base-nova` preset), so the `render={<Element />}` pattern replaces Radix's `asChild`.
- **Tailwind v4**: theme tokens live in `globals.css` under `@theme inline`. Use `cn()` from `lib/utils.ts` for conditional class merging.
- **Naming**: files/folders `kebab-case`; React components `PascalCase`; hooks `useCamelCase`; DB tables/columns `snake_case` mapped to `camelCase` in TS.
- **Server action naming**: end function names with `Action` (e.g., `createProjectAction`); place in `lib/actions/<entity>.ts` with a `"use server"` directive at the top of the file.
- **Status enums** are defined in `schema.ts` as `as const` arrays and reused by both Drizzle column types and Zod `z.enum(...)`.

## Adding a new domain entity (checklist)

1. Add the table to `src/lib/db/schema.ts` (include `createdAt`/`updatedAt` via the `timestamps` helper, FK with `onDelete: "cascade"` if owned by a parent).
2. `npm run db:generate` and commit the generated migration.
3. Add Zod schema in `src/lib/validators/<entity>.ts` (use the `optionalString` / `optionalIsoDate` `preprocess` helpers for empty-string handling).
4. Add a service in `src/lib/services/<entity>.ts` exposing CRUD + domain operations. Generate IDs with `nanoid(12)`.
5. Add server actions in `src/lib/actions/<entity>.ts` returning `ActionResult<T>` and calling `revalidatePath(...)`.
6. Build UI under `src/app/(dashboard)/<entity>/` and `src/components/<entity>/`.
7. Add a Vitest test for the service/validator and a Playwright spec for the primary user flow.

## Things to avoid

- Importing `better-sqlite3` or Drizzle anywhere outside `lib/db/*`, `lib/services/*`, or `lib/db/migrate.ts`.
- Storing dates as `Date` objects in the DB — pick the ISO string convention and stay consistent.
- Hand-editing files in `src/lib/db/migrations/`.
- Using Radix-style `asChild` on shadcn components in this repo — they're `@base-ui/react`-based and use the `render` prop.
- Adding a `tailwind.config.js` — Tailwind v4 is configured in `globals.css`.
- Wrapping `next dev` with `--turbo` (deprecated in Next 16; Turbopack is default).

## See also

- `AGENTS.md` (and `CLAUDE.md`) — generated by Next.js scaffolding; reminds agents that Next 16 differs from prior knowledge.
- `README.md` — quickstart and scripts overview.
