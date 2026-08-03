# KRUSANT — Code Review & Refactoring Plan

Review date: 2026-07-27. Scope: `packages/backend`, `packages/frontend`, `packages/shared`, CI/deploy scripts (~13.8k LoC).

The codebase is in decent structural shape — clear module-per-domain layout on the backend, sensible
page/component split on the frontend, React Query already adopted. The problems are concentrated in
three places: **authorization is almost entirely absent**, **the build silently ships type errors**,
and **CRUD boilerplate is copy-pasted six times over**.

---

## Phase 0 — Security (do this before anything else)

These are exploitable today against the live deployment at `krusant.szkolazlotnictwa.pl`.

### 0.1 Unauthenticated password reset — full account takeover

`auth/passport-auth.controller.ts:121` exposes `POST /api/auth/reset-password` with **no guard**:

```ts
@Post('reset-password')
async resetPassword(@Body() body: { email: string; newPassword: string }) {
  return this.authService.resetPassword(body.email, body.newPassword);
}
```

Anyone who knows (or guesses) an admin's email address can set that admin's password and log in.
A duplicate, *properly* guarded version already exists at `users.controller.ts:81`
(`POST /api/users/:id/reset-password`, `@Roles(Role.Admin)`).

**Fix:** delete the `auth` route outright. The frontend only calls the `users` one
(`api/endpoints/usersAdmin.ts`). If a self-service "forgot password" flow is wanted later, it needs a
token-by-email flow, not a bare email+newPassword body.

### 0.2 Unauthenticated backfill endpoint

`POST /api/auth/backfill-teachers` (`passport-auth.controller.ts:104`) has no guard; it is gated only
by `process.env.ALLOW_BACKFILL !== 'true'` checked inside the service. A one-time migration should not
be a permanent public route.

**Fix:** delete the route and `backfillUsersFromTeachers()`, or move it to a `nest command`-style
script run over SSH.

### 0.3 Nine of twelve controllers have no auth at all

Audited every controller for `@UseGuards`:

| Controller | Guard | Exposed operations |
|---|---|---|
| `students` | `AuthGuard('jwt')` | ok (no role check) |
| `users` | JWT + `RolesGuard` + `@Roles(Admin)` | ok |
| `auth` | per-route | partial (see 0.1, 0.2) |
| `classes` | **none** | full CRUD + attendance + batch |
| `courses` | **none** | full CRUD + batch |
| `debits` | **none** | full CRUD |
| `group-templates` | **none** | full CRUD |
| `groups` | **none** | full CRUD + batch |
| `payments` | **none** | full CRUD |
| `rooms` | **none** | full CRUD |
| `settings` | **none** | read + update |
| `teachers` | **none** | list, signup, delete, batch |

Every student's financial record, every payment, every debit, and the whole schedule are readable and
writable without a session. CORS restricts *browsers*, but `curl` is unaffected.

**Fix:** make authentication the default rather than opt-in. Register the JWT guard globally in
`app.module.ts` and mark the small set of genuinely public routes explicitly:

```ts
// app.module.ts providers
{ provide: APP_GUARD, useClass: PassportJwtAuthGuard },
{ provide: APP_GUARD, useClass: RolesGuard },
```

Then add a `@Public()` decorator (sets metadata; `PassportJwtAuthGuard.canActivate` returns `true`
when present) and apply it to `POST /auth/login`, `POST /auth/logout`, `GET /auth/google`,
`GET /auth/google/callback`, and `GET /` (`AppController`). Everything else becomes closed by default
— including any controller added in future, which is the property worth buying here.

Layer roles on afterwards: `settings`, `courses`, `rooms`, `teachers`, `group-templates` are admin-only;
`classes`/`groups`/`students` read for teachers, write for admins; `payments`/`debits` admin-only.
This is the `TODO.txt` item *"przekminić authentykację z rolami per endpoints"* and the `.todo` item
*"zdekaplować teachera od superusera"*.

### 0.4 Password hashing and token hygiene

`users.service.ts:69-79`:

- `verifyPassword` compares hex strings with `===` — not constant-time. Use
  `crypto.timingSafeEqual` on the decoded buffers.
- Salt is 8 bytes (`randomBytes(8)`); 16 is the conventional minimum.
- `scrypt` runs at default cost with a 32-byte output. Fine, but pin the params explicitly so they can
  be raised later, and store them in the hash string.
- `verifyPassword` will throw `TypeError` rather than return `false` if `passwordHash` is ever null.

Also: the JWT is signed with `expiresIn: '3d'` (`auth.module.ts:28`) but the cookie carrying it is set
with `maxAge: 24 * 60 * 60 * 1000` (24h, in two places). Pick one lifetime and derive both from a
single constant.

### 0.5 Unvalidated `JWT_SECRET`

`auth.module.ts:27` reads `process.env.JWT_SECRET` with no fallback and no validation. If the env file
is missing on deploy the failure mode is a confusing runtime error, not a clear boot failure.

**Fix:** adopt `@nestjs/config` with a validation schema, fail fast at boot on missing
`JWT_SECRET` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. This also removes the ad-hoc
`dotenv.config()` call currently sitting at module scope in `auth.module.ts:16-17`.

---

## Phase 1 — Correctness bugs

### 1.1 `nest build` does not type-check, and it is hiding real errors

`nest-cli.json` sets `"builder": "swc", "typeCheck": false`. Running `tsc --noEmit` in `packages/backend`
right now reports two genuine errors:

```
src/groups/groups.service.ts(19,14): error TS2339: Property 'courseId' does not exist on type 'CreateGroupDto'.
src/groups/groups.service.ts(20,75): error TS2339: Property 'courseId' does not exist on type 'CreateGroupDto'.
```

**This is a live bug, not just a type complaint.** `GroupsService.applyCourseDefaults` (`groups.service.ts:18`)
branches on `dto.courseId`, but `CreateGroupDto` has no `courseId` property — and `main.ts:28` enables
`ValidationPipe({ whitelist: true })`, which *strips* any property not declared on the DTO. So `courseId`
never survives the pipe, `applyCourseDefaults` returns on its first line every single time, and the
entire "inherit name/cost/unitCost from the course" feature is dead code. It has presumably never fired
in production.

**Fix:** add `courseId?: number` to `CreateGroupDto` (`@IsOptional() @IsInt()`), and relax `name`/`cost`/
`unitCost` to optional so the defaulting path in `create()` is actually reachable. Then add a
`typecheck` script and wire it into CI so this class of bug can't recur:

```json
"typecheck": "tsc --noEmit"
```

Keep swc for build speed; run `tsc --noEmit` as a separate gate.

### 1.2 `setAttendance` — N+1 query inside a loop, plus no transaction

`classes.service.ts:86-116`:

```ts
for (const studentId of attendedStudentsIds) {
  const existing = await this.debitsService.findAll();   // <-- entire debits table, per student
  const alreadyExists = existing.some(...)
```

`findAll()` loads **every debit in the database** once per attending student. With 20 students in a
class and a few thousand debits that's 20 full table scans per attendance save. It also:

- has no transaction, so a mid-loop failure leaves a class marked attended with only some debits created;
- resolves the student via `this.classRepository.manager.getRepository('Student')` — a string lookup
  that defeats typing, when `Student` is already imported at the top of the file (`classes.service.ts:7`);
- never *removes* debits when a student is un-marked, so correcting a mistaken attendance silently
  leaves the student owing money.

**Fix:** one `debitsRepository.find({ where: { classId } })` before the loop; wrap the whole method in
`dataSource.transaction`; inject `@InjectRepository(Student)`; reconcile removals (delete debits for
students no longer in `attendedStudentsIds`, guarding against ones already settled).

### 1.3 Finances page drops rows on ID collision

`Pages/Finances/useFinanceEntries.ts` merges payments and debits into one array preserving each
record's own `id`. `Components/Common/Table/index.tsx:56` then does `getRowId={(row) => row.id}`.
Payment #3 and debit #3 are different rows with the same grid ID — MUI DataGrid will warn and drop one.

**Fix:** synthesise a composite key in the hook: `id: \`payment-${p.id}\`` / `` `debit-${d.id}` ``,
keeping the numeric original in a separate `entityId` field for mutations.

### 1.4 `?active=false` silently means "no filter"

`students.controller.ts:36` and `:54`:

```ts
const isActive = active === 'true' ? true : undefined;
```

`?active=false` collapses to `undefined`, so the service returns *all* students instead of only the
inactive ones. Use `@Query('active') active?: string` → `active === undefined ? undefined : active === 'true'`,
or a `ParseBoolPipe({ optional: true })`.

### 1.5 No `ParseIntPipe`, no 404s

Every controller does `+id` / `parseInt(id)` on the raw param. `GET /api/rooms/abc` becomes
`findOne(NaN)`. And every `findOne` returns `null` for a missing row, which the controller returns
verbatim — clients get `200 OK` with a `null` body instead of `404`.

**Fix:** `@Param('id', ParseIntPipe) id: number` throughout, and have the shared base service (Phase 2)
throw `NotFoundException`. Both come almost free once the base class exists.

### 1.6 CI deploys a directory that is never built

`.github/workflows/deploy.yml`:

```yaml
scp -r packages/backend/dist $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend
```

`nest build` emits to `build/` (`tsconfig.json` `"outDir": "./build"`); `dist/` does not exist. The
local `ci/deploy_backend.sh` correctly uses `packages/backend/build/*`. The GitHub Actions path has
been wrong since it was written.

Also in that workflow: `npm --workspaces install` is not a valid way to install a workspace root —
it should be `npm ci` at the repo root, which is also what makes `cache: 'npm'` useful.

**Fix:** correct the path to `packages/backend/build`, switch to `npm ci`, and add `typecheck` + `test`
steps ahead of the deploy so a broken build can't reach the server. Separately, both deploy scripts
`scp -r build/*` onto the server without clearing the target first — stale files from previous
releases accumulate. Add an `rsync --delete` or a `rm -rf` step.

---

## Phase 2 — Collapse the duplicated CRUD layer

`rooms`, `courses`, `teachers`, `groups`, `group-templates` and `students` each carry a service and a
controller that are ~95% identical. `RoomsService` and `CoursesService` differ only in the words "room"
and "course" — including the comments. The `batchUpsert` method is copy-pasted **six times**, each a
serial `for` loop of `findOne` → `update` → `findOne` (3 queries per row, no transaction, no bulk insert).

That is roughly 400 lines of the backend that exists only because nothing was extracted.

**Proposed shape:**

```
src/common/
  base-crud.service.ts     // findAll/findOne/create/update/remove/batchUpsertBy(key)
  base-crud.controller.ts  // mixin factory producing the standard 6 routes + swagger decorators
  decorators/public.decorator.ts
  decorators/current-user.decorator.ts
```

`BaseCrudService<TEntity, TCreateDto, TUpdateDto>` holds the repository and implements the six standard
methods, throwing `NotFoundException` on misses and running `batchUpsert` inside a single transaction
with a bulk `upsert` on the natural key. `RoomsService` then becomes:

```ts
@Injectable()
export class RoomsService extends BaseCrudService<Room, CreateRoomDto, UpdateRoomDto> {
  constructor(@InjectRepository(Room) repo: Repository<Room>) {
    super(repo, { uniqueBy: 'name' });
  }
}
```

Domains with extra behaviour keep it by overriding: `GroupsService.create` still calls
`applyCourseDefaults`, `ClassesService` keeps `setAttendance`, `StudentsService` keeps
`findAllWithBalance`.

Do this **after** Phase 0/1 — a base class is much easier to write once auth is global and the
`NotFoundException` / `ParseIntPipe` decisions are settled, and it's the natural place to put them.

**Order:** `rooms` and `courses` first (pure CRUD, lowest risk, proves the abstraction), then
`teachers` and `group-templates`, then `groups`/`students`/`classes` where the overrides live.

---

## Phase 3 — Frontend consistency

### 3.1 Two data-fetching paradigms

Most pages use React Query (`Students`, `Finances`, `Classes`, `Groups`). `Pages/UsersManagement/index.tsx`
(486 lines — the largest file in the repo) instead hand-rolls `useState` + `useEffect` + four
`loading`/`error`/`success` state pairs and manual `await loadUsers()` refetches after every mutation.

**Fix:** rewrite as `useQuery(['users'])` + `useMutation` with `invalidateQueries`. That deletes the
`loading`/`formLoading`/`error`/`success` state entirely and drops the file to roughly half its size.
Extract the four near-identical dialogs (create/edit/reset/delete) — the create and edit dialogs differ
only in title, helper text and submit handler.

Also worth noting: `Finances` (`index.tsx:24-38`) fires mutations with no `onError`, so a failed
payment save closes nothing and shows the user nothing.

### 3.2 The GroupWizard validation tangle

Four modules with overlapping responsibility:

| File | Lines | Imported by |
|---|---|---|
| `validationSchema.ts` | 61 | `index.tsx`, `createHandleSaveGroup.ts` — **live** |
| `validationGroup.ts` | 33 | `GroupNameWrapper` only |
| `validation.ts` | 31 | only by `useWizardValidation.ts` — **dead** |
| `hooks/useWizardValidation.ts` | 63 | **nothing — dead** |

`useWizardValidation.ts:6` carries its own `// TODO refactor and get rid of duplication with validationSchema.ts`.

**Fix:** delete `useWizardValidation.ts` and `validation.ts`; fold `getGroupNameError` into
`validationSchema.ts` as the single source of truth.

### 3.3 Dead code to delete

- `Components/Common/TableOld/index.tsx` (91 lines) — zero importers
- `utils/throttle.ts` — zero importers
- `Components/GroupWizard/index.backup` — a checked-in backup file
- `setupTests.ts` — nothing references it (see 4.2)
- `react-app-env.d.ts` — CRA leftover, superseded by `vite-env.d.ts`
- `reportWebVitals.ts` — called from `index.tsx:49` with no callback, so it measures and discards
- `payments/migrate-payments.ts` (backend) — a one-shot migration, never imported
- ~49 blocks of commented-out code across both packages (`AuthContext/index.tsx:41-48`,
  `App.tsx` route comments, `app.module.ts:35`, etc.)
- Backend `ClassEntity` imports `ManyToMany` and `Student` and uses neither (`class.entity.ts:7-9`)

### 3.4 Auth UX gaps in `App.tsx`

`App.tsx:33` renders `<Login />` whenever `!isAuthenticated`, but `AuthContext` exposes an `isLoading`
that `App` ignores — so on every page load the login screen flashes before the `currentUser` query
resolves. And there is no per-route role gating (matching the backend gap in 0.3): a `student` role can
reach `/users` and `/administration` in the SPA even once the API starts rejecting them.

**Fix:** render a splash while `isLoading`; add a `<RequireRole roles={['admin']}>` wrapper around the
admin routes once `Role` lands in the shared package.

### 3.5 Hardcoded strings and hosts

All UI copy is inline Polish. Some components have `copy.ts` files (`DurationSlider`, `RoomSelector`,
`TeacherSelector`, `NameInput`, …) suggesting the intent existed, but most strings sit in JSX. Not urgent —
this is a single-locale internal tool — but if a `copy.ts` convention is wanted, it should be applied
consistently or dropped.

More actionable: hardcoded hosts. `main.ts:20` pins `http://83.168.71.6:3001` in the CORS list;
`Dashboard/Widgets/MetalPrices/datasource.ts:3` hardcodes the absolute production URL
`https://krusant.szkolazlotnictwa.pl/metal-price-api` — so the metals widget in local dev silently hits
production. Both should come from env (`CORS_ORIGINS`, `VITE_METAL_API_URL`), with the latter defaulting
to a relative `/metal-price-api` so nginx handles it.

---

## Phase 4 — Tooling that is currently non-functional

### 4.1 ESLint is broken in all three packages

Confirmed by running it: `npx eslint src/main.ts` in the backend exits with an error. All three
`eslint.config.mjs` files import `defineConfig` from `eslint-define-config` — a package that appears in
no `package.json` — and extend legacy `airbnb` / `airbnb-typescript` configs that predate flat config.
`@eslint/eslintrc`'s `FlatCompat` is installed in the backend but never used.

**Fix:** write real flat configs. Backend: `typescript-eslint` recommended + `eslint-plugin-prettier`
(both already installed). Frontend: `typescript-eslint` + `eslint-plugin-react-hooks` +
`eslint-plugin-react-refresh`. Dropping airbnb is the pragmatic call — bridging it through `FlatCompat`
drags in five more plugins for a style guide nothing currently conforms to.

### 4.2 Neither test suite runs

- **Frontend:** `vite.config.ts` has no `test` block — no `globals: true`, no `environment: 'jsdom'`,
  no `setupFiles`. `App.test.tsx` uses bare `test`/`expect` and fails with `ReferenceError: test is not defined`.
  `VITE_MIGRATION.md` claims vitest is wired up; it is not.
- **Backend:** the scaffolded `*.spec.ts` files for teachers, groups and students never had their
  `TestingModule` updated with repository mocks after real `@InjectRepository` dependencies were added.
  They fail with "Nest can't resolve dependencies".

**Fix:** add the `test` block to `vite.config.ts` pointing at `setupTests.ts`; give the backend specs
`getRepositoryToken(Entity)` mock providers. Then write tests for the things Phase 0–2 touch — the
`RolesGuard` matrix, `setAttendance` debit reconciliation, and the balance query in
`findAllWithBalance` are the three highest-value targets, since they're where money and access
decisions are computed.

### 4.3 Missing root scripts

`package.json` at the workspace root has only four `dev:`/`build:` scripts. There is no root
`lint`, `test`, or `typecheck`. `../build.sh` duplicates the two build scripts in a shell file that
lives outside the git repo.

**Fix:** add `lint`, `test`, `typecheck`, `build` to the root, each fanning out with
`npm run --workspaces --if-present <script>`; delete `build.sh` in favour of `npm run build`.

---

## Phase 5 — Data model (largest change; defer until the above lands)

### 5.1 `synchronize: true` against production data

`app.module.ts:49` and `data-source.ts:12` (which carries its own `// TODO set to false in production`).
TypeORM will alter the live schema to match whatever the entity files say on every boot. On SQLite a
column rename is a table rebuild — one careless entity edit silently drops a column of real student
financial data, with no migration history to recover from.

The two entity lists are also **out of sync**: `app.module.ts` registers 11 entities, `data-source.ts`
registers 4 (`Group`, `Student`, `Debit`, `Payment`). Anything run through the TypeORM CLI sees a
different schema than the app does.

**Fix:** export a single shared entity array from one module, import it in both. Then generate a
baseline migration from the current schema, set `synchronize: false`, and run migrations on deploy.

### 5.2 Foreign keys as loose integers

Most cross-domain links are plain `int` columns — `Group.teacherId`, `ClassEntity.groupId`/`roomId`/
`teacherId`, `Payment.studentId`, `Debit.studentId` — with no `@ManyToOne`, so the database enforces
nothing. Group membership is worse: `Group.studentIds` and `Group.classIds` are JSON arrays
(`group.entity.ts:20-24`). Deleting a student leaves their ID embedded in every group's JSON, and
`findAllWithBalance` has to reach for raw SQLite `json_each` to query it (`students.service.ts:36-38`),
which welds that query to SQLite specifically.

This is the root cause of the manual N+1 joins scattered through the services and of
`useFinanceEntries.ts` fetching all payments, all debits and all students to build a name map on the client.

**Fix (incremental, one relation at a time):** convert `Group.studentIds` to a real `@ManyToMany` join
table first — it's the one causing the most pain — then add `@ManyToOne` for the class/group/room/teacher
links. Each conversion needs a data migration, so this genuinely does belong last.

---

## Suggested sequencing

| Phase | Effort | Risk | Why now |
|---|---|---|---|
| **0 — Security** | ~1 day | low | Exploitable against live data today |
| **1 — Correctness bugs** | ~1 day | low | Each is small, isolated, and independently verifiable |
| **4.1/4.3 — Lint + root scripts** | ~half day | none | Needed to keep Phase 2 honest |
| **2 — CRUD base classes** | ~2 days | medium | Removes ~400 lines; do after auth is global |
| **3 — Frontend cleanup** | ~2 days | low | Mostly deletions and one page rewrite |
| **4.2 — Test wiring** | ~1 day | none | Then backfill tests for guards, attendance, balances |
| **5 — Data model** | ~1 week | high | Needs migrations; only worth it once the rest is stable |

Phases 0 and 1 are independent of each other and of everything below — they can go out as small,
separately reviewable commits without waiting on the structural work.

## Two things worth *not* changing

- **Polish-language domain vocabulary** (`kursant`, `obciążenie`, `zobowiązanie`). It matches how the
  users talk about the business. Translating it to English would make the code harder to discuss with
  the people who actually run the school.
- **SQLite + `better-sqlite3`.** For a single-site back-office app with this data volume it is the right
  call; Postgres would add operational burden for no gain. Only 5.1's raw `json_each` SQL bakes in the
  dependency, and converting `studentIds` to a join table removes even that.
