# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keeping this file current

**This file goes stale fast, and stale guidance here is worse than no guidance** — it has previously
described tables that no longer exist and build settings that had been inverted, and that misinformation
got acted on. Treat it as part of the change, not documentation written afterwards.

Update it in the **same commit** whenever you:
- add, remove, rename or merge an entity/table, or change a schema-level rule (constraints, nullability)
- add or remove a module, workspace, page or route
- change how something is built, run, tested, linted or deployed
- discover a gotcha that cost you time (the "Gotchas" section exists so nobody pays that cost twice)
- fix something this file claims is broken — **delete the claim**, don't leave it

Before relying on a specific claim here (a version, a flag, a table), **verify it against the code**.
If you find something wrong, fix it as you go.

## What this is

KRUSANT is an admin/back-office web app for a Polish jewellery school (`szkolazlotnictwa.pl`). It manages
students (*kursanci*), teachers, groups, courses, rooms, classes/lessons, attendance, payments and debits
(*obciążenia*). Domain vocabulary and UI copy are Polish throughout — this is deliberate, it matches how
the users talk about the business. Keep it that way.

npm-workspaces monorepo with **two** packages:
- `packages/backend` — NestJS API
- `packages/frontend` — React 19 + Vite SPA

(There was a `packages/shared`; it was an unused placeholder and has been deleted.)

## Commands

Run from `monorepo/` — this is the git repo root. The parent `KRUSANT/` folder holds deploy scripts and
is not version-controlled.

```bash
npm install              # once, all workspaces

npm run dev:backend      # nest start        -> http://localhost:3002
npm run dev:frontend     # vite              -> http://localhost:3001

# these fan out across workspaces with --if-present
npm run typecheck        # tsc --noEmit (backend) + tsc (frontend)
npm run test             # jest (backend) + vitest (frontend)
npm run lint             # eslint --fix
npm run build
```

All four root scripts work and pass. Lint reports ~81 warnings and 0 errors — warnings are the baseline,
errors are not.

Backend-only (from `packages/backend`):
```bash
npx jest src/classes/classes.service.spec.ts   # single test file
npm run migration:run                          # apply pending migrations
npm run migration:generate src/migrations/Name # diff entities against the DB
npm run migration:revert                       # roll back the last one
```

Frontend-only (from `packages/frontend`):
```bash
npx vitest run src/App.test.tsx   # single file, non-watch (bare `npm test` watches)
```

## Architecture

### Backend (NestJS, `packages/backend/src`)

Module-per-domain: `auth`, `classes`, `common`, `courses`, `debits`, `groups`, `payments`, `rooms`,
`settings`, `students`, `users`. Each has `*.entity.ts` / `*.service.ts` / `*.controller.ts` /
`*.module.ts` / `dto/`. Listens on **3002**, global prefix `api`, Swagger at `/api/docs`.

**Persistence: TypeORM 1.x + SQLite via `better-sqlite3`.** TypeORM 1.x dropped the plain `sqlite` driver
— only `better-sqlite3` remains, so don't reintroduce `type: 'sqlite'`.

- **`synchronize: false`. Schema changes go through migrations, always.** `src/entities.ts` is the single
  entity list, imported by both `app.module.ts` and `src/data-source.ts` (they used to drift; don't
  re-split them). `ci/deploy_backend.sh` runs `migration:run` before restarting pm2.
- `db.sqlite` lives in `packages/backend/`, resolved relative to CWD. Backups in `db-backups/` (gitignored).

**Data model — read this before assuming a shape:**

- **A teacher is a `user` with the `teacher` role.** There is no `teacher` table. `group.teacherId` /
  `class.teacherId` reference `user(id)`. `GET /teachers` is a *read-only projection* of teacher-role
  users (`users/teachers.controller.ts`) that exists so non-admins can populate teacher dropdowns —
  it carries a bare `@Roles()` override for exactly that reason. Create/edit teachers via `/users`.
- **Templates live in the `group` table behind `isTemplate`.** There is no `group_template` table.
  `GroupsService.findAll` always takes an explicit `isTemplate` side so templates can't leak into a list
  of real groups. `group.teacherId` is nullable *only* because templates may not have one — a CHECK
  constraint (`isTemplate = 1 OR teacherId IS NOT NULL`) still requires it for real groups.
- **Membership is join tables, never JSON arrays.** `group_students`, `group_classes`,
  `class_attended_students`, `class_planned_students`. Services keep the old wire format
  (`studentIds` / `attendedStudentsIds` …) via a `toResponse` mapping, so the API shape is unchanged
  even though storage isn't. `GroupsService` and `ClassesService` both follow this pattern and
  deliberately do **not** extend `BaseCrudService` (their response shape differs from the entity on
  every method).
- **Cross-domain links are plain int columns with real FK constraints**, not `@ManyToOne` relations.
  Required/financial links (`group.teacherId`, `payment.studentId`, `debits.studentId`) are
  `ON DELETE RESTRICT`; optional ones (`roomId`, `groupId`, `class.teacherId`, `debits.classId`) are
  `SET NULL`. `BaseCrudService.remove` and `UsersService.remove` translate the resulting constraint
  violation into a 409.

**Auth:** Passport `local` / `jwt` / `google` strategies, JWT in an httpOnly cookie, 24h lifetime from
`auth.constants.ts`. Closed by default — `PassportJwtAuthGuard`, `ForcePasswordChangeGuard` and
`RolesGuard` are global `APP_GUARD`s, in that order; public routes opt out with `@Public()`.
`ThrottlerGuard` is registered *first* so a hammered login is rate-limited before hitting auth
(global 60/min, login and change-password 5/min).

`JwtStrategy.validate` **re-reads roles and `mustChangePassword` from the database on every request**
rather than trusting the token payload, so a revoked role takes effect immediately instead of after 24h —
and a user who just changed their password isn't stuck behind a stale flag. Don't "optimise" that away.

**There is no self-signup.** An admin creates every account on the Users page; there is no registration
endpoint, and Google sign-in **rejects any email without an existing account** rather than provisioning
one. The old auto-provisioning branch is kept behind `ALLOW_SELF_SIGNUP` (`auth.service.ts`, default
off) so it can be turned back on without a rewrite — don't delete it. The frontend half is the
commented-out `registerMutation` in `AuthContext` plus `authApi.register`, which points at a route that
does not exist.

**Temporary passwords.** Admins never choose or see a password. `POST /users` and
`POST /users/:id/reset-password` (no body) both generate one, store its hash, and email it via
`MailService`; the plaintext is returned to the admin **only if the email failed**, which is the one
moment it can be read. `user.mustChangePassword` then blocks every route except `/auth/profile`,
`/auth/logout` and `/auth/change-password` until it's changed, and `user.tempPasswordExpiresAt` (24h)
makes the password itself stop authenticating — after that an admin has to re-issue. Signing in with
Google clears `mustChangePassword` (reaching the mailbox proves ownership) but deliberately leaves the
expiry alone, so the emailed password still dies on schedule.

**SMTP is optional.** Without `MAIL_HOST`/`MAIL_FROM` the app runs normally and `MailService` reports a
failed send, which is exactly the path that surfaces the password in the UI. A send failure never rolls
back an account that was already created.

**TypeScript is pinned to `^6.0.3` here, not 7.x** — `ts-jest` and `typescript-eslint` don't support TS7
yet. `tsconfig.json` sets `"strict": false` and an explicit `"types": ["node", "jest"]` (auto @types
discovery doesn't reach the hoisted root `node_modules` in this layout).

### Frontend (React 19 + Vite, `packages/frontend/src`)

Vite (migrated from CRA — env vars are `VITE_`-prefixed). TypeScript tracks latest (`^7.x`) here, unlike
the backend. Path aliases must stay in sync between `vite.config.ts` and `tsconfig.json`.

- **Pages/routes**: `/` Dashboard, `/students`, `/groups`, `/classes`, `/finances`, `/templates`,
  `/teachers`, `/rooms`, `/courses`, `/users`, `/administration`. All lazy-loaded via `React.lazy`.
- **Routes are role-gated** by `<RequireRole>` in `App.tsx`, matching what the backend enforces. Dashboard
  is open to any authenticated user; `students`/`groups`/`classes` are admin+teacher; the rest admin-only.
  `Menu/index.tsx` must agree with `App.tsx` — if you change one, change the other.
- **A pending password change replaces the whole app**, before routing is reached: `AppContent` renders
  `<ChangePassword forced />` instead of the router whenever `mustChangePassword` is set. Don't turn this
  into a redirect — with a temporary password the backend refuses every other endpoint, so any other
  screen would just render errors. `MIN_PASSWORD_LENGTH` there must match the backend's
  `users.constants.ts`.
- **API layer**: `api/client.ts` (fetch, `credentials: 'include'`, unwraps `{data, success}`) +
  `api/endpoints/*.ts`, consumed through **TanStack React Query**. Auth state in `context/AuthContext`.
  Note `groupTemplatesApi` is a thin adapter over `/groups` that maps `name` ↔ `templateName`.
- **Shared CRUD UI**: `Components/Common/SimpleCrudPage` drives the Teachers/Rooms/Courses pages (table +
  form dialog + delete confirm). Prefer extending it over hand-rolling another CRUD screen.
- **UI kit: MUI v9** (+ x-data-grid, x-date-pickers-pro), FullCalendar for scheduling, `dayjs`/`luxon`
  both present — check which a file already uses.
- Test runner is **Vitest**, not Jest.

## Gotchas

These each cost real debugging time. They are not hypothetical.

- **SQLite migrations, `down()` only:** `PRAGMA foreign_keys = OFF` is a **no-op inside an already-open
  transaction**, which is exactly where `migration:revert` runs. Use **`PRAGMA defer_foreign_keys = ON`**
  instead. It defers checks to COMMIT but does *not* suppress `ON DELETE CASCADE`, so a `down()` that
  rebuilds a parent table must still back up and restore its junction tables. `up()` is unaffected —
  `migration:run` disables foreign_keys before opening its transaction.
- **Never remap ids with a loop of per-row `UPDATE`s.** Use a temp mapping table and one `UPDATE` per
  table, or rows already remapped get caught again when one entity's old id equals another's new id.
- **`POST /classes/:id/attendance` takes a bare JSON array** (`[1,2,3]`), not `{attendedStudentsIds:[…]}`.
  A malformed body now 400s; it used to be coerced to `[]`, which silently wiped the roster *and deleted
  every debit for that class*.
- **MUI v9 dropped system props.** `<Stack alignItems="center" mb={2}>` must become `sx={{...}}`;
  `TextField`'s `inputProps`/`InputProps` became `slotProps={{ htmlInput, input, inputLabel }}`;
  `Autocomplete`'s `renderTags` became `renderValue`. A `TS2769`/`TS2322` on an MUI prop is almost always
  one of these.
- **`@fullcalendar/*` is pinned to 6.1.x on purpose** — `daygrid`/`interaction`/`timegrid` only have 7.x
  as prereleases, peer-incompatible with stable core/react v7. Bump the whole family or none of it.
- **Testing MUI X DataGrid under jsdom:** its toolbar renders CSS jsdom can't resolve, so any
  `screen.*ByRole()` scanning the whole document throws. Find the dialog with a raw
  `document.querySelector('[role="dialog"]')` and scope queries with `within()`. See
  `SimpleCrudPage.test.tsx`.
- **Killing a backgrounded dev server on Windows:** `pkill` doesn't reliably work here. Find the real PID
  with `netstat -ano | grep ":3002"` and use `powershell -Command "Stop-Process -Id <PID> -Force"`.
  Verify the port is actually free before trusting a smoke test against a "restarted" server.
- **`nest build` uses swc with `typeCheck: false`** — type errors do not fail the build. Run
  `npm run typecheck` separately. **Nothing runs it for you** — there is no CI; see Deployment.

## Deployment

Single VPS, plain scp+ssh scripts in the top-level `ci/` folder. Backend runs under pm2 (process `main`);
nginx serves the frontend build and proxies `/api` from the same origin.

```bash
bash ci/deploy_backend.sh    # build -> ship -> migration:run -> pm2 restart
bash ci/deploy_frontend.sh   # build -> clear remote dir -> ship
```

- **Always back up production `db.sqlite` before a backend deploy** that touches schema, and dry-run the
  migration against a copy of real production data first (including a full `up → down → up` cycle).
  This has caught real bugs that typechecking and unit tests did not.
- `deploy_frontend.sh` does `rm -rf` on the remote directory **before** scp. If the connection drops in
  between, production is left with an empty web root until the deploy is re-run.
- **There is no CI, and deploys are manual.** A `.github/workflows/deploy.yml` used to fire on pushes to
  `release`, but it only scp'd build output — no `npm install`, no `migration:run`, no pm2 restart — so
  after `synchronize: false` landed it would have left production running old code against an unmigrated
  database. It was deleted rather than maintained as a second, divergent deploy path. The scripts above
  are the only way to deploy; run `npm run typecheck && npm run lint && npm run test` yourself first.
