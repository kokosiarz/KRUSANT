# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

KRUSANT is an admin/back-office web app for a school (Polish domain: "szkoła" — course provider "szkolazlotnictwa.pl"). It manages students (kursanci), teachers, groups, group templates, courses, rooms, classes/lessons, attendance, payments and debits (financial obligations). Domain notes and comments in the code are frequently in Polish (see `TODO.txt`, `packages/backend/.todo`, `packages/frontend/.todo` at repo root/package level for current product priorities — worth checking for intent before large feature work).

This is an npm-workspaces monorepo:
- `packages/backend` — NestJS API
- `packages/frontend` — React 19 + Vite SPA
- `packages/shared` — thin shared types/utils package (currently minimal, mostly a placeholder — check before assuming it's wired into build output)

## Commands

Run from `monorepo/` (the workspace root — this is the actual git repo; the parent `KRUSANT/` folder just contains deployment scripts and is not version controlled here).

```bash
# install once for all workspaces
npm install

# dev servers
npm run dev:backend     # nest start --watch  -> http://localhost:3002
npm run dev:frontend    # vite                -> http://localhost:3001

# build (also used by CI/deploy)
npm run build:backend   # nest build (swc) -> packages/backend/build
npm run build:frontend  # tsc && vite build -> packages/frontend/build
```

Backend-specific (run inside `packages/backend`):
```bash
npm run start:debug     # nest start --debug --watch
npm run lint            # eslint --fix
npm test                # jest, all *.spec.ts under src/
npx jest src/students/students.service.spec.ts   # single test file
npm run test:e2e        # jest -c test/jest-e2e.json
npm run test:cov
```

Frontend-specific (run inside `packages/frontend`):
```bash
npm run lint            # eslint --fix
npm test                # vitest (watch mode by default)
npx vitest run src/App.test.tsx    # single test file, non-watch
npm run preview          # serve the production build locally
```

There is no root-level test/lint script — run them per-workspace, or via `npm --workspace <name> run <script>` from `monorepo/`.

## Architecture

### Backend (NestJS, `packages/backend/src`)

- Standard Nest module-per-domain layout: `students`, `groups`, `teachers`, `courses`, `rooms`, `classes`, `payments`, `debits`, `group-templates`, `settings`, `users`, `auth`. Each has `*.entity.ts`, `*.service.ts`, `*.controller.ts`, `*.module.ts`, `dto/`.
- Persistence: TypeORM with **SQLite** (`db.sqlite`, file lives in `packages/backend/`), `synchronize: true` (no migration-driven schema — schema follows entities directly; `src/migrations/` and `src/data-source.ts` exist for the TypeORM CLI but are not the primary way schema changes happen). All entities must be registered in `TypeOrmModule.forRoot({ entities: [...] })` in `app.module.ts` — note `data-source.ts` has its own separate, shorter entity list; keep both in sync if you touch either.
- **Entities mostly do NOT use TypeORM relations for cross-domain links** — most links are plain integer FK columns (e.g. `Group.teacherId`, `ClassEntity.groupId`/`roomId`/`teacherId`, `Payment.studentId`, `Debit.studentId`) resolved manually in services, not via `@ManyToOne`/joins. `Student` is the exception (has real `@OneToMany`/`@ManyToMany` relations to `Debit`, `Payment`, `ClassEntity`). `Group` also stores membership as JSON array columns (`studentIds`, `classIds`) rather than a join table — don't assume a `group.students` relation exists.
- Auth: Passport strategies (`local`, `jwt`, `google`) under `auth/strategies`, JWT issued via `@nestjs/jwt` (3-day expiry), delivered as an httpOnly cookie (`cookie-parser` is enabled globally). Role model: `Role` enum (`admin`/`teacher`/`student`) on `User.roles` (stored as `simple-array`), enforced via `@Roles()` decorator + `RolesGuard` (reads `request.user.roles`) — but per `TODO.txt`/`.todo` files this is still a work in progress ("przekminić autentykację z rolami per endpoints", "zdekaplować teachera od superusera") and not yet applied consistently across controllers. Don't assume every endpoint is role-gated — check the specific controller.
- `main.ts`: global prefix `api`, global `ValidationPipe({ whitelist: true })`, CORS locked to specific origins (localhost:3001, prod domain) with `credentials: true`, Swagger served at `/api/docs`. **On every backend boot it regenerates `openapi.json` in the backend package and overwrites `packages/frontend/backend_openapi.json`** — this is the mechanism that keeps frontend API types in sync with the backend; if you change a DTO/controller, run the backend once to refresh that file.
- Listens on port **3002** in dev (not Nest's default 3000).

### Frontend (React 19 + Vite, `packages/frontend/src`)

- Bundler: **Vite** (migrated from CRA/Craco — see `VITE_MIGRATION.md` for what changed if you hit stale assumptions from old CRA-era code/comments). Env vars use the `VITE_` prefix, not `REACT_APP_`.
- Path aliases (must stay in sync between `vite.config.ts` and `tsconfig.json`): `@/*`, `@api/*`, `@components/*`, `@common/*`, `@pages/*`, `@hooks/*`, `@utils/*`.
- Structure: `Pages/<Feature>` (route-level screens: Dashboard, Students, Groups, Classes, Finances, Settings, UsersManagement, Administration, Login), `Components/` (shared UI: `TopBar`, `GroupWizard`, `StudentForm`, `Common`, `ProfilePanel`), `Menu/`, `context/` (`AuthContext`, `Settings`), `hooks/`, `api/` (`client.ts` fetch wrapper + `endpoints/*.ts` per domain + `types.ts`), `settings/defaults.json`.
- API layer: hand-written fetch client in `api/client.ts` (`credentials: 'include'` for cookie auth, unwraps `{ data, success }` envelopes automatically), consumed through **TanStack React Query**. Auth state lives in `context/AuthContext` (`useQuery(['currentUser'])` + login/logout mutations) exposed via `hooks/useAuth.ts`. See `API_INTEGRATION.md` for the intended usage patterns (some of it describes an aspirational/older API surface — check `api/endpoints/*.ts` for what's actually implemented).
- Routing: plain `react-router-dom` switch in `App.tsx` — currently binary (logged in → routed app with `TopBar`; logged out → `Login`), no per-route role restriction yet on the frontend (matches the backend's incomplete role enforcement noted above).
- UI kit: MUI v7 (+ `x-data-grid`, `x-date-pickers-pro`), FullCalendar for scheduling views, `dayjs`/`luxon` both present for dates — check which a given file already uses before introducing the other.
- Test runner is **Vitest**, not Jest, despite some `@testing-library`/`@types/jest` leftovers from the CRA era.

### Deployment

- No Docker in active use (`ci/docker/` is empty). Deploys are plain scp+ssh scripts at the top-level `ci/` folder (`deploy_backend.sh`, `deploy_frontend.sh`) targeting a single VPS, process-managed with `pm2` (backend, process name `main`) and served by nginx (`ci/nginx.config`) for the frontend static build.
- GitHub Actions (`.github/workflows/deploy.yml`) builds both packages on push to `release` and scp's `packages/frontend/build` and `packages/backend/dist` to the server — **note this dist path (`packages/backend/dist`) doesn't match the local build script's output dir (`packages/backend/build`, per `nest build`/`nest-cli.json`); verify which is correct before trusting the CI workflow blindly.**
- Backend build uses `swc` (fast, `typeCheck: false` per `nest-cli.json`) — type errors won't fail `nest build`; rely on `tsc`/editor/tests to catch them.
