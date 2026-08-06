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
- **Membership is join tables, never JSON arrays.** `group_students`, `class_planned_students` —
  both genuinely many-to-many (a student sits in several groups; a class has a roster planned before
  it happens). Services keep the old wire format (`studentIds` / `plannedStudentsIds` …) via a
  `toResponse` mapping, so the API shape is unchanged even though storage isn't. `GroupsService` and
  `ClassesService` both follow this pattern and deliberately do **not** extend `BaseCrudService`
  (their response shape differs from the entity on every method).
- **Attendance is three states, not a join table.** `class_attendance` (`ClassAttendance` entity) has
  one row per marked `(classId, studentId)` with a `status`: `present` (obecność), `absent`
  (nieobecność, still billed — same as present), or `rescheduled` (przełożone, excused, **not**
  billed). A plain `@ManyToMany`/`@JoinTable` — what the old `class_attended_students` binary table
  was — has no room for that status column, so this had to become a real entity; a missing row still
  means "unmarked", same convention as before. `ClassesService.setAttendance` (`POST
  /classes/:id/attendance`) is a full replace: an id absent from the incoming array goes back to
  unmarked, and it creates/removes the matching `Debit` based on billable status (present/absent → debit,
  rescheduled → no debit). A student's outstanding przełożone balance shown on `/students` is
  **computed, not linked**: every `rescheduled` marking minus every `present` marking in a class
  belonging to a group the student doesn't belong to (a make-up lesson attended elsewhere), clamped at
  0 — see `StudentsService.findAllWithBalance`. There is no explicit link between a specific
  reschedule and the make-up that settles it.
- **A class belongs to a group through `class.groupId` — one-to-many, no join table.** A class
  happens once, for one group, so there is deliberately no `Group.classes` relation. A `group_classes`
  junction table used to exist alongside it; nothing ever wrote to it, so `GET /groups` reported every
  group as having zero classes. It was dropped. `GroupsService` derives the `classIds` response field
  from `class.groupId`, and group writes ignore `classIds` entirely — assign a class to a group by
  setting its own `groupId` via the Classes endpoints.
- **Cross-domain links are plain int columns with real FK constraints**, not `@ManyToOne` relations.
  Required/financial links (`group.teacherId`, `payment.studentId`, `debits.studentId`) are
  `ON DELETE RESTRICT`; optional ones (`roomId`, `groupId`, `class.teacherId`, `debits.classId`) are
  `SET NULL`. `BaseCrudService.remove` and `UsersService.remove` translate the resulting constraint
  violation into a 409.

**Action log / undo.** Every create, update and delete on **groups and classes** is recorded in
`action_log` with a JSON snapshot of the record `before` and `after` (the API-level shape, so an undo
replays through the same service methods that handle membership). `GET /history` lists it and
`POST /history/:id/undo` reverses one — both admin-only.

Three things keep undo safe, and none should be removed:
- **Conflict check.** `afterUpdatedAt` stores the record's `updatedAt` right after the logged write.
  Undo requires it to still match; if someone edited the record since, it refuses with 409 rather
  than discarding their change. For a delete, the check is that the id isn't taken again.
- **`schemaVersion`.** Bump `ACTION_LOG_SCHEMA_VERSION` whenever a migration changes the shape of
  `class` or `group`. Older entries stay in the log (the audit trail is the point) but their undo is
  disabled with a reason, instead of failing when someone presses the button.
- **`undoneAt`** so an entry can't be applied twice.

`GroupsService`/`ClassesService` call `registerHandler` in `onModuleInit` to teach the log how to
load/restore/revert/remove their records — the dependency points one way, they know about the log and
not the reverse, which would be circular since they call it on every write. The actor comes from
`request.user`, threaded through the controllers as an optional `actor` argument.

**Auth:** Passport `local` / `jwt` / `google` strategies, JWT in an httpOnly cookie, 24h lifetime from
`auth.constants.ts`. Closed by default — `PassportJwtAuthGuard`, `ForcePasswordChangeGuard` and
`RolesGuard` are global `APP_GUARD`s, in that order; public routes opt out with `@Public()`.
`ThrottlerGuard` is registered *first* so a hammered login is rate-limited before hitting auth
(global 60/min, login and change-password 5/min).

`JwtStrategy.validate` **re-reads roles and `mustChangePassword` from the database on every request**
rather than trusting the token payload, so a revoked role takes effect immediately instead of after 24h —
and a user who just changed their password isn't stuck behind a stale flag. Don't "optimise" that away.

**Passkeys (WebAuthn).** Face ID / Touch ID / Windows Hello sign-in lives in `auth/passkey/`.
Registration requires an authenticated session — that's what binds a credential to a known account
and keeps this from becoming a self-signup backdoor; login is public and usernameless
(`residentKey: 'required'` makes the credential discoverable). It issues the *same* JWT cookie as the
password and Google paths, so guards and roles behave identically.

Three things there are load-bearing and easy to "fix" wrongly:
- **`rpID` is a bare domain** derived from `FRONTEND_URL` (override: `WEBAUTHN_RP_ID`). Credentials
  are bound to it permanently — changing it invalidates every existing passkey.
- **The signature counter is recorded, never enforced.** iCloud/Google-synced passkeys report 0
  forever; rejecting a non-increasing counter would lock out every one of them.
- **`ChallengeStore` is in memory.** Fine for one pm2 process; if this ever runs as more than one
  instance it must move to the DB or Redis, or verify can land on a process that never issued the
  challenge.

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
  `/teachers`, `/rooms`, `/courses`, `/users`, `/historia`, `/administration`. All lazy-loaded via
  `React.lazy`.
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
- **Styling lives in `theme.ts`, not in pages.** One bronze accent (the school is a goldsmithing
  school) over cool neutrals, hairline borders instead of shadows, and `textTransform: none` on
  Button/ToggleButton. Component overrides there cover AppBar, Paper/Card, inputs, Dialog, Alert,
  DataGrid and the toggle groups — restyle there rather than adding `sx` to individual pages.
  Typeface is **self-hosted Inter** (`@fontsource-variable/inter`, imported in `index.tsx`); the theme
  asked for Inter for a long time while nothing loaded it, so everything silently rendered in Segoe UI.
- **`CommonTable` renders cards below `md`, a DataGrid above it.** A DataGrid at phone width silently
  drops to ~3 columns with no horizontal scroll, so balance, the funds forecast and the row's
  edit/delete buttons were unreachable on a phone. The card branch shows every column as a
  label/value pair; `primaryColumnId` / `actionsColumnId` control the card heading and footer. Add
  columns normally — both layouts pick them up.
- **Mobile and desktop are two different calendars.** `FullCallendarWrapper/index.tsx` returns
  `SwipeableCalendar` below `md` and a plain `FullCalendar` above it — not one component with
  breakpoint props. A 7-day `timeGridWeek` gives each day ~25px, which shredded every event title, so
  phones get an agenda list (`listWeek`) or a month grid, and drag-to-reschedule and
  drag-out-to-delete stay desktop-only.
  `SwipeableCalendar` is a **carousel**: the previous and next periods are mounted either side of the
  current one and the whole track moves with the finger, so a swipe drags the next week in rather than
  pushing the current one into a gap. Two things there are load-bearing:
  - **Each pane is keyed by its date.** `initialDate` is only read at mount, so the keys are what let
    a swipe shift the array by one, keep two of the three instances, and mount only the newly exposed
    side. Change the key scheme and every swipe remounts three calendars.
  - **The hand-over is one `flushSync`.** Moving the anchor re-keys the panes and resetting the track
    by one pane cancels that out; if the two paint separately the calendar visibly jumps back a period
    before correcting. Same reflow discipline as the Gotchas entry below.
  It replaces FullCalendar's own toolbar with its own header, because each pane would otherwise render
  a copy and slide it off with the content. `SwipeableCalendar.test.tsx` covers the stepping
  arithmetic and swipe direction — mock `@fullcalendar/react` there rather than rendering three real
  calendars under jsdom.
- **Haptics (`utils/haptics.ts`) are Android-only, by omission not oversight.** iOS implements no
  Vibration API in any browser, and the documented workarounds hinge on side effects of unrelated
  elements. Never make a vibration the only feedback for an action.
- **Page header actions go through `Components/Common/PageHeaderActions`.** Every page had its own
  flex row with a different gap (one also added `ml: 2` to a single button), so controls sat at
  different heights and spacings per screen. Keep header controls at the default size — the theme
  matches ToggleButton's padding to Button's so the two line up.
- **It's an installable PWA.** `vite-plugin-pwa` generates `sw.js` at build time; the manifest is
  hand-written in `public/manifest.json` (the plugin is set to `manifest: false` so branding stays
  readable). `src/pwa.ts` registers the worker and `Components/PwaPrompts` offers the install.
  Every icon in `public/` is generated by `assets/brand/generate-icons.sh` — don't hand-edit them,
  re-run it. That folder holds the raster and vector masters and lives outside `public/` on purpose:
  anything in there is not just copied into the build but swept into the service worker's precache by
  `globPatterns`, so a 1.2 MB master would be downloaded by every install for nothing. The favicon and
  PWA icons are transparent and full-bleed; `apple-touch-icon` and the maskable icon are opaque and
  inset, for reasons the README spells out — they are not oversights to "fix".
  Two rules worth keeping:
  - **`/api/*` is `NetworkOnly` and excluded from the navigation fallback.** Serving a cached balance,
    roster or attendance record would be worse than an honest offline error.
  - **`registerType: 'prompt'`, never `autoUpdate`.** A new version must not swap itself in under
    someone mid-edit; the worker waits and the user presses "Odśwież".
  iOS never fires `beforeinstallprompt`, so `PwaPrompts` detects it and shows Share-sheet
  instructions instead of a button that cannot work. A dismissal is remembered for 30 days under
  `krusant.installPromptDismissedAt`.
- **Colour mode is persisted** in `localStorage` under `krusant.colorMode`, defaulting to the OS
  preference. It used to be plain component state, so every reload snapped back to dark.
- **FullCalendar knows nothing about the MUI theme** — it's dressed to match by hand in
  `Pages/Classes/Components/FullCallendarWrapper/styles.tsx`. Its own rules are specific
  (`.fc-button-primary:not(:disabled).fc-button-active`), so overrides have to match that shape or
  they lose silently.
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
- **`POST /classes/:id/attendance` takes a bare JSON array of `{studentId, status}`**, not
  `{attendedStudentsIds:[…]}` and not a bare array of ids either (that was the shape before the
  three-state attendance refactor). `status` is `'present' | 'absent' | 'rescheduled'`. A malformed
  body 400s rather than being coerced to `[]`, which used to silently wipe the roster *and delete every
  debit for that class* — `ClassesService.setAttendance` still does its own manual validation instead
  of a class-validator DTO, because Nest's `ValidationPipe` doesn't validate item-by-item against a
  bare-array-of-objects `@Body()` parameter.
- **MUI v9 dropped the colour-specific `styleOverrides` slots.** `containedPrimary`, `standardInfo`
  and friends no longer typecheck — per-colour/severity styling goes in a `variants: [{ props, style }]`
  array on the component instead. See `MuiButton`/`MuiAlert` in `theme.ts`.
- **MUI v9 dropped system props.** `<Stack alignItems="center" mb={2}>` must become `sx={{...}}`;
  `TextField`'s `inputProps`/`InputProps` became `slotProps={{ htmlInput, input, inputLabel }}`;
  `Autocomplete`'s `renderTags` became `renderValue`. A `TS2769`/`TS2322` on an MUI prop is almost always
  one of these.
- **A Drawer's width goes on its paper slot, not on the content inside it.**
  `slotProps={{ paper: { sx: { width } } }}`, not `<Box sx={{ width }}>` as the drawer's child. The paper
  is shrink-to-fit, so a percentage width on the child resolves against a paper that stays wider than
  the child — leaving a dead strip along the edge that dividers stop short of and text wraps before.
  It looks like stray padding; it isn't. See `Menu/index.tsx` and `Components/ProfilePanel`.
- **Animating "slide out, swap, slide in" needs a forced reflow between the swap and the slide back in.**
  React batches the jump-to-far-edge and the animate-to-centre into one style recalculation, so the
  browser never sees the far edge and animates from wherever the element already was — the new content
  slides in from the side the old content just left. `flushSync` the jump, read layout
  (`getBoundingClientRect()`), then `flushSync` the return. See `FullCallendarWrapper/index.tsx`.
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
