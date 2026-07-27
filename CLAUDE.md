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
npm run lint            # eslint --fix — currently BROKEN, see note below
npm test                # jest, all *.spec.ts under src/
npx jest src/students/students.service.spec.ts   # single test file
npm run test:e2e        # jest -c test/jest-e2e.json
npm run test:cov
```
Several of the NestJS-CLI-scaffolded `*.service.spec.ts`/`*.controller.spec.ts` files (teachers, groups, students) never got their `TestingModule` updated with repository mocks after real `@InjectRepository` dependencies were added to the services — they fail with "Nest can't resolve dependencies" regardless of package versions. Pre-existing, not caused by any upgrade.

Frontend-specific (run inside `packages/frontend`):
```bash
npm run lint            # eslint --fix — currently BROKEN, see note below
npm test                # vitest (watch mode by default) — currently BROKEN, see note below
npx vitest run src/App.test.tsx    # single test file, non-watch
npm run preview          # serve the production build locally
```
`App.test.tsx` uses global `test`/`expect` (Jest-style), but `vite.config.ts` has no `test` block at all — no `globals: true`, no `environment: 'jsdom'`, no `setupFiles` wiring to `setupTests.ts`. It fails with `ReferenceError: test is not defined`. This was never finished after the CRA→Vite migration (`VITE_MIGRATION.md` claims vitest is wired up; it isn't). Pre-existing, not caused by any upgrade.

**Both packages' `eslint.config.mjs` are pre-existing dead config**, unrelated to any dependency version: they call `defineConfig` from `eslint-define-config` (a package that was never actually added to either `package.json`) and extend legacy `airbnb`/`airbnb-base`/`airbnb-typescript` configs, which don't work with ESLint's flat-config format (`@eslint/eslintrc`'s `FlatCompat` is installed in the backend but never used to bridge them). `npm run lint` fails immediately with `ERR_MODULE_NOT_FOUND` in both packages. Fixing this means writing a real flat-config file (dropping airbnb or wrapping it in `FlatCompat`), not a version bump.

There is no root-level test/lint script — run them per-workspace, or via `npm --workspace <name> run <script>` from `monorepo/`.

## Architecture

### Backend (NestJS, `packages/backend/src`)

- Standard Nest module-per-domain layout: `students`, `groups`, `teachers`, `courses`, `rooms`, `classes`, `payments`, `debits`, `group-templates`, `settings`, `users`, `auth`. Each has `*.entity.ts`, `*.service.ts`, `*.controller.ts`, `*.module.ts`, `dto/`.
- Persistence: TypeORM (v1.x) with **SQLite via the `better-sqlite3` driver** (`type: 'better-sqlite3'`, `db.sqlite` file lives in `packages/backend/`), `synchronize: true` (no migration-driven schema — schema follows entities directly; `src/migrations/` and `src/data-source.ts` exist for the TypeORM CLI but are not the primary way schema changes happen). TypeORM 1.x **dropped the plain `sqlite3`-driver `"sqlite"` type entirely** — only `"better-sqlite3"` remains for embedded SQLite, so don't reintroduce the `sqlite3` npm package or `type: 'sqlite'`. All entities must be registered in `TypeOrmModule.forRoot({ entities: [...] })` in `app.module.ts` — note `data-source.ts` has its own separate, shorter entity list; keep both in sync if you touch either.
- **Entities mostly do NOT use TypeORM relations for cross-domain links** — most links are plain integer FK columns (e.g. `Group.teacherId`, `ClassEntity.groupId`/`roomId`/`teacherId`, `Payment.studentId`, `Debit.studentId`) resolved manually in services, not via `@ManyToOne`/joins. `Student` is the exception (has real `@OneToMany`/`@ManyToMany` relations to `Debit`, `Payment`, `ClassEntity`). `Group` also stores membership as JSON array columns (`studentIds`, `classIds`) rather than a join table — don't assume a `group.students` relation exists.
- Auth: Passport strategies (`local`, `jwt`, `google`) under `auth/strategies`, JWT issued via `@nestjs/jwt` (3-day expiry), delivered as an httpOnly cookie (`cookie-parser` is enabled globally). Role model: `Role` enum (`admin`/`teacher`/`student`) on `User.roles` (stored as `simple-array`), enforced via `@Roles()` decorator + `RolesGuard` (reads `request.user.roles`) — but per `TODO.txt`/`.todo` files this is still a work in progress ("przekminić autentykację z rolami per endpoints", "zdekaplować teachera od superusera") and not yet applied consistently across controllers. Don't assume every endpoint is role-gated — check the specific controller.
- `main.ts`: global prefix `api`, global `ValidationPipe({ whitelist: true })`, CORS locked to specific origins (localhost:3001, prod domain) with `credentials: true`, Swagger served at `/api/docs`. **On every backend boot it regenerates `openapi.json` in the backend package and overwrites `packages/frontend/backend_openapi.json`** — this is the mechanism that keeps frontend API types in sync with the backend; if you change a DTO/controller, run the backend once to refresh that file.
- Listens on port **3002** in dev (not Nest's default 3000).
- **TypeScript is intentionally pinned to `^6.0.3` here, not the current `7.x` line** — `ts-jest` (peer `typescript >=4.3 <7`) and `typescript-eslint` (peer `typescript >=4.8.4 <6.1.0`) don't support TS7 yet. Don't bump backend `typescript` past 6.0.x until both packages catch up, or `npm test`/lint will break. `tsconfig.json` also sets `"strict": false` explicitly (newer TS defaults strict-family checks on when nothing is specified at all — this codebase relies on decorator-populated entity/DTO fields with no initializers and loose null handling, so leave it off unless doing a deliberate strictness pass) and `"types": ["node", "jest"]` (auto @types-folder discovery doesn't reliably walk up to the hoisted root `node_modules/@types` in this workspace layout — without an explicit `types` array, `describe`/`it`/`expect` silently fail to resolve under ts-jest).

### Frontend (React 19 + Vite, `packages/frontend/src`)

- Bundler: **Vite** (migrated from CRA/Craco — see `VITE_MIGRATION.md` for what changed if you hit stale assumptions from old CRA-era code/comments). Env vars use the `VITE_` prefix, not `REACT_APP_`.
- Path aliases (must stay in sync between `vite.config.ts` and `tsconfig.json`): `@/*`, `@api/*`, `@components/*`, `@common/*`, `@pages/*`, `@hooks/*`, `@utils/*`. Note `tsconfig.json`'s `paths` values are `"./src/*"`-style (leading `./`, no `baseUrl`) — TypeScript 7 **removed `baseUrl` and `moduleResolution: "node"` outright** (hard errors, not deprecation warnings); this project now uses `moduleResolution: "bundler"` with relative `paths`. Frontend `typescript` tracks current latest (`^7.x`) fine since nothing here (unlike the backend) has a peer range capping it below 7.
- `tsconfig.json` sets `"types": ["vite/client", "node"]` explicitly for the same reason as the backend — automatic `@types` folder discovery doesn't reliably reach the hoisted root `node_modules/@types` in this workspace layout, which previously surfaced as `Cannot find name 'require'`/`NodeJS` errors in a few files that still use CommonJS `require()`.
- Structure: `Pages/<Feature>` (route-level screens: Dashboard, Students, Groups, Classes, Finances, Settings, UsersManagement, Administration, Login), `Components/` (shared UI: `TopBar`, `GroupWizard`, `StudentForm`, `Common`, `ProfilePanel`), `Menu/`, `context/` (`AuthContext`, `Settings`), `hooks/`, `api/` (`client.ts` fetch wrapper + `endpoints/*.ts` per domain + `types.ts`), `settings/defaults.json`.
- API layer: hand-written fetch client in `api/client.ts` (`credentials: 'include'` for cookie auth, unwraps `{ data, success }` envelopes automatically), consumed through **TanStack React Query**. Auth state lives in `context/AuthContext` (`useQuery(['currentUser'])` + login/logout mutations) exposed via `hooks/useAuth.ts`. See `API_INTEGRATION.md` for the intended usage patterns (some of it describes an aspirational/older API surface — check `api/endpoints/*.ts` for what's actually implemented).
- Routing: plain `react-router-dom` switch in `App.tsx` — currently binary (logged in → routed app with `TopBar`; logged out → `Login`), no per-route role restriction yet on the frontend (matches the backend's incomplete role enforcement noted above).
- UI kit: **MUI v9** (+ `x-data-grid`, `x-date-pickers-pro`, both also v9), FullCalendar for scheduling views, `dayjs`/`luxon` both present for dates — check which a given file already uses before introducing the other.
  - MUI v9 dropped the old "system props" shorthand on layout components (`Box`, `Stack`, `Typography`, `ListItemText`, etc.) — you can no longer write `<Stack alignItems="center" mb={2}>` or `<Typography fontWeight={700}>` directly; those props must go inside `sx={{ ... }}`. `TextField`'s `inputProps`/`InputProps`/`InputLabelProps` are similarly gone in favor of `slotProps={{ htmlInput, input, inputLabel }}`, and `Autocomplete`'s `renderTags(value, getTagProps)` is now `renderValue(value, getItemProps)`. If you see a `TS2769`/`TS2322`/`TS2353` error on an MUI component about a prop "not existing", it's almost always one of these — move it into `sx`/`slotProps` rather than typing around it.
  - `@fullcalendar/*` packages are pinned to the `6.1.x` line on purpose: `@fullcalendar/core`/`react` have a stable `7.x`, but `daygrid`/`interaction`/`timegrid` only have `7.x` as beta/rc prereleases (peer-incompatible with the stable `core`/`react` v7). Don't bump core/react to `7.x` alone — wait until the whole family has a matching stable major.
  - `@ambiot/material-ui-multiple-dates-picker` was removed (was unused dead weight — grep confirmed no imports anywhere outside a throwaway ambient `.d.ts` stub — and it hard-pins `@mui/material@^5.10.9`, which blocks `npm install` outright once MUI is on v9). `react-multi-date-picker` is also currently unused in `src/` but was left alone since it doesn't block anything.
- Test runner is **Vitest**, not Jest, despite some `@testing-library`/`@types/jest` leftovers from the CRA era.

### Deployment

- No Docker in active use (`ci/docker/` is empty). Deploys are plain scp+ssh scripts at the top-level `ci/` folder (`deploy_backend.sh`, `deploy_frontend.sh`) targeting a single VPS, process-managed with `pm2` (backend, process name `main`) and served by nginx (`ci/nginx.config`) for the frontend static build.
- GitHub Actions (`.github/workflows/deploy.yml`) builds both packages on push to `release` and scp's `packages/frontend/build` and `packages/backend/dist` to the server — **note this dist path (`packages/backend/dist`) doesn't match the local build script's output dir (`packages/backend/build`, per `nest build`/`nest-cli.json`); verify which is correct before trusting the CI workflow blindly.**
- Backend build uses `swc` (fast, `typeCheck: false` per `nest-cli.json`) — type errors won't fail `nest build`; rely on `tsc`/editor/tests to catch them.
